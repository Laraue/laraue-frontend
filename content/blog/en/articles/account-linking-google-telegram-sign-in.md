---
title: Account linking — Google and Telegram sign-in on one account in ASP.NET Core
description: Part 28 of the series about building a Telegram task tracker in a tiny team. How we added Google sign-in, why one person ended up with two users, how a user connects a second sign-in method to their account, when we take an account over from an "empty" user, and how we revoke JWTs that were already issued.
seoTitle: Account Linking: Google and Telegram Sign-In in ASP.NET Core
seoDescription: Part 28: Google sign-in in ASP.NET Core, linking it with a Telegram account, SELECT FOR UPDATE on merge, and revoking JWTs with a token version.
type: article
series: architecture-first
part: 28
createdAt: 2026-10-30 19:54
updatedAt: 2026-10-30 19:54
projects: [boards]
tags: [devlog, dotnet, authentication, database]
---

> **Architecture First: Building a Jira Alternative in a Tiny Team, AI-Assisted** — Part 28.
> In the [previous article](running-our-backlog-with-claude-code-mcp) AI agents got access to the tasks through an MCP server. Until then, the only way to sign in to Boards was Telegram. At the end of September Google sign-in arrived, and account linking right after it.

## The short version

How Google sign-in and account linking work:

1. The backend verifies the Google ID token the frontend gets from the Google button itself: the signature, the expiry, the issuer, and that the token was issued for our client.
2. A Boards user got a `GoogleSubject`, and `TelegramId` became optional. A user who signed in only with Google works in the web app, but without the bot.
3. At first, signing in with Google and with Telegram created two separate users. A day later a user could connect the second sign-in method in the account settings.
4. If the account being connected already belongs to another user, we take it over only when that user has no data. Otherwise the connection is refused with a clear message.
5. Connecting takes two steps: first a call to the Identity service with no transaction, then the changes in the Boards database in a transaction that locks rows with `SELECT ... FOR UPDATE`.
6. A user who lost their last sign-in method is marked deleted and their tokens are revoked: every JWT now carries the user's token version.

## Google sign-in: verifying the ID token in the backend

The frontend shows the Google button and gets an ID token from it, a JWT signed by Google. The token goes to `POST /api/user/auth-via-google`. The backend verifies it with the Google.Apis.Auth library and responds by setting the same user cookie as the Telegram sign-in does (cookies are covered in [part 24](jwt-httponly-cookie-aspnet-core)).

The check, as the code looked at the time (slightly shortened):

```csharp
public async Task<GoogleIdTokenPayload> ValidateAsync(string idToken, CancellationToken cancellationToken)
{
    var clientId = options.Value.ClientId;

    // An empty audience list makes the verification skip the audience check entirely, i.e.
    // accept a token issued for *any* Google OAuth client - refuse to run like that.
    if (string.IsNullOrWhiteSpace(clientId))
        throw new InvalidOperationException("GoogleAuth:ClientId is not configured.");

    GoogleJsonWebSignature.Payload payload;
    try
    {
        payload = await JsonWebSignature.VerifySignedTokenAsync<GoogleJsonWebSignature.Payload>(
            idToken,
            new SignedTokenVerificationOptions
            {
                TrustedAudiences = { clientId },
                TrustedIssuers = { "accounts.google.com", "https://accounts.google.com" },
            },
            cancellationToken);
    }
    catch (InvalidJwtException)
    {
        throw new ForbiddenException(ErrorMessages.GoogleIdTokenInvalid);
    }

    return new GoogleIdTokenPayload(payload.Subject, payload.Email, payload.Name, payload.GivenName, payload.FamilyName);
}
```

There are two traps here, both in the verification options:

- **An empty audience list.** If `TrustedAudiences` is empty, the library does not check the `aud` claim at all and accepts a token issued for *any* Google OAuth client. So without `GoogleAuth:ClientId` the service refuses to run instead of running without the check.
- **An empty issuer list.** Without `TrustedIssuers`, the `iss` claim is not checked either. We listed Google's issuers explicitly.

We call `JsonWebSignature.VerifySignedTokenAsync` rather than the better-known `GoogleJsonWebSignature.ValidateAsync` because the latter has no overload with a `CancellationToken`.

We look the user up by `sub`, the permanent id of the Google account. Email does not work for that: it can change. If there is no user with that `sub` yet, they are registered the same way as on a first Telegram sign-in, with a personal organization and a default space.

## A user without Telegram

Until then every Boards user came from Telegram, and `TelegramId` was required. With Google sign-in the user model became this:

```csharp
public class User
{
    public Guid Id { get; set; }
    public Guid GlobalUserId { get; set; }

    /// Null for a user who has only ever signed in with Google - such a user
    /// can use the web app, but none of the Telegram bot's features.
    public long? TelegramId { get; set; }

    /// The Google ID token's sub claim. Null for a Telegram-only user.
    [MaxLength(255)]
    public string? GoogleSubject { get; set; }

    [MaxLength(129)]
    public string DisplayName { get; set; } = string.Empty;
    // ...
}
```

The same migration removed the Telegram profile fields from the `users` table: username, first name, last name and language. The profile now lives in Laraue Identity, a separate service shared by the Laraue apps, and Boards keeps only the identifiers and how to show the user in the interface. Boards passes data to Identity only after verifying it: the Google ID token itself never gets there.

Without Telegram, a user cannot save messages from chats, use the `/save` command or the inline search. We added a note to the sign-in and invite pages that these features work only with Telegram sign-in. Once linking arrived, the note was removed.

## One person, two users

Linking was not part of the first version of Google sign-in: signing in with Google and with Telegram created two separate users. If someone had used Boards through Telegram and then signed in with Google, they got a second user with its own empty personal organization.

The main case that called for linking is the opposite one: a person signs up with Google and later wants the bot's features. For that they need to connect Telegram to the account they already have, not create a second one.

## How to connect a second sign-in method

The account settings got a "Connected accounts" tab with the Telegram widget and the Google button. Behind them are two API methods for a signed-in user:

```csharp
[Authorize(AuthenticationSchemes = AuthSchemas.User)]
[ApiController]
[Route("/api/user/connected-accounts")]
public class ConnectedAccountsController(
    ITelegramAuthService telegramAuthService,
    IConnectedAccountsService connectedAccountsService)
    : ControllerBase
{
    [HttpPost("telegram")]
    public Task<ConnectAccountResponse> ConnectTelegram(
        [FromBody] TelegramWidgetAuthRequest request,
        CancellationToken cancellationToken)
    {
        return telegramAuthService.ConnectTelegram(HttpContext.User.GetId(), request, cancellationToken);
    }

    [HttpPost("google")]
    public Task<ConnectAccountResponse> ConnectGoogle(
        [FromBody] ConnectGoogleAccountRequest request,
        CancellationToken cancellationToken)
    {
        return connectedAccountsService.ConnectGoogle(HttpContext.User.GetId(), request, cancellationToken);
    }
}
```

The Telegram widget data is verified the same way as on sign-in (the scheme is described in [part 13](telegram-login-widget-dotnet-auth)), and the Google ID token by the same validator as above.

We wrote the rules down in the issue before starting:

- **A user has one Telegram and one Google account.** A second account of the same kind cannot be connected.
- **Google cannot be connected inside the Telegram Mini App.** Google does not allow signing in from embedded app browsers, so Google is connected only in a regular browser.
- **An account cannot be disconnected.** That was left out of scope.

After Telegram is connected, the backend does what the Telegram sign-up does: it links the personal chat with the bot to the default status of the personal organization. From then on, messages sent to the bot become tasks.

In the issue we planned to answer a conflict with a 409. In the end refusals come back as an ordinary 200 with an outcome:

```csharp
public enum AccountLinkOutcome
{
    Linked,                    // the account is now connected (it may have been already)
    UserHasOtherAccount,       // one Telegram, one Google per user
    OwnerHasData,              // another Boards user has this account and has data
    OwnerUsedByAnotherService, // another Laraue app uses the account's current owner
}
```

The frontend's error handling looks only at the status code, and each refusal needs its own message. An invalid Telegram signature or an invalid Google ID token is still a 403.

## When the account is taken: the "empty" user

The most common conflict is the one described above: the person already has a second user created by the other sign-in method. Most often it is a user who signed up and did nothing. Such an account can be taken over: there is nothing to lose in it.

"Did nothing" had to be defined precisely. We check everything a user could have created or taken part in, and we do not count what the sign-up created: a personal organization with one space, one board and one status, and the personal chat with the bot. Shortened:

```csharp
private async Task<bool> HasDataAsync(Guid userId, CancellationToken cancellationToken)
{
    return await context.Issues.AnyAsync(x => x.OwnerId == userId || x.AssigneeId == userId, cancellationToken)
        || await context.IssueComments.AnyAsync(x => x.OwnerId == userId, cancellationToken)
        || await context.OrganizationLogs.AnyAsync(x => x.OwnerId == userId, cancellationToken)
        // a member of someone else's organization, or the owner of a non-personal one
        || await context.OrganizationUsers.AnyAsync(
            x => x.UserId == userId && x.Organization!.OwnerId != userId, cancellationToken)
        || await context.Organizations.AnyAsync(
            x => x.OwnerId == userId && x.Type != OrganizationType.Personal, cancellationToken)
        // the personal organization was changed after sign-up
        || await context.Spaces.AnyAsync(x => x.Organization!.OwnerId == userId && !x.IsDefault, cancellationToken)
        || await context.Statuses.CountAsync(x => x.Epic!.Space!.Organization!.OwnerId == userId, cancellationToken) > 1
        || await context.Attributes.AnyAsync(x => x.Organization!.OwnerId == userId, cancellationToken)
        || await context.ApiKeys.AnyAsync(x => x.CreatedByUserId == userId, cancellationToken)
        || await context.RetroParticipants.AnyAsync(x => x.UserId == userId, cancellationToken)
        // ... epics, other members, retro cards and votes, other linked chats
        ;
}
```

The change history (see [part 20](audit-log-change-history-one-transaction)) records only issues and comments, so changes to spaces, boards, statuses and attributes are checked separately.

If there is data, Boards answers `OwnerHasData` right away and does not call Identity at all. Fully merging two users that both have data we left for a separate task, if it is ever needed.

There is a second check on the Identity side. One global Laraue user can be a user of several apps. If the owner of the account is used by another app as well, Identity does not move the account, and Boards answers `OwnerUsedByAnotherService`.

## Identity first, then a transaction in Boards

Connecting touches two databases: Identity stores which Telegram or Google account belongs to which global user, and Boards stores its own `TelegramId` and `GoogleSubject`. We did not want to hold a database transaction open during a gRPC call, so connecting is split into two steps:

```csharp
var outcome = await coreUserService.LinkGoogleAccountInIdentity(userId, profile, cancellationToken);
if (outcome == AccountLinkOutcome.Linked)
{
    await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
    await coreUserService.LinkGoogleAccountInBoards(userId, profile, cancellationToken);
    await transaction.CommitAsync(cancellationToken);
}
```

The first step checks the rules and calls Identity without changing anything in the Boards database. The second runs only if Identity answered with success, and requires an open transaction: the method starts with `EnsureTransactionStarted()`.

If the service fails between the steps, Identity already knows about the link and Boards does not. So both steps are safe to repeat: Identity answers a repeated link with success, and the second step finds the previous owner again and does not create the personal chat if it already exists. The user just presses the button again.

The second step starts by locking rows. Otherwise two concurrent requests, a double click on the button for example, could both pass the checks and fail on the unique index of the personal chat. We wrote the lock with linq2db because EF Core has no `FOR UPDATE`:

```csharp
public static Task LockUsers(
    this DatabaseContext context,
    Expression<Func<User, bool>> predicate,
    CancellationToken cancellationToken = default)
{
    context.Database.EnsureTransactionStarted();

    return context.Users
        .ToLinqToDB()
        .Where(predicate)
        .OrderBy(x => x.Id)
        .Select(x => x.Id)
        .QueryHint(PostgreSQLHints.ForUpdate)
        .ToListAsyncLinqToDB(cancellationToken);
}
```

It locks the current user and the owner of the account being connected: `LockUsers(x => x.Id == userId || x.GoogleSubject == profile.GoogleSubject)`. Rows are locked in `Id` order so that two transactions with overlapping sets of users cannot deadlock. The second request waits for the first one to finish and then sees its result.

After the lock, the account is removed from the previous owner and written to the current user.

## What happened to the empty user

In the issue we first decided to leave the empty user without a sign-in method but not delete them. That decision changed during the work: if a user loses their last sign-in method, they are marked deleted, and `DeletedByUserId` holds the user who took the account over. By then organizations, spaces, issues and comments already had soft delete; now users joined them.

Their personal organization stays as it is: it has no other members, so nobody can reach it any more. Which user they were merged into is recorded only in Identity. If the previous owner still has another sign-in method, they stay a regular user.

## Revoking tokens: a version in the JWT

The first version of linking left a problem. A browser where the person was signed in as the empty user kept working with it until the JWT expired. The next sign-in led to the right user, but until then the person saw an empty account. There was no way to revoke an issued token: the backend checked only the signature and the expiry.

We added a token version to the user, `TokenVersion`. It is written into every user and organization token as the `tv` claim:

```csharp
public string CreateUserToken(Guid userId, int tokenVersion)
{
    var claims = new List<Claim>
    {
        new("id", userId.ToString()),
        new(TokenVersionClaim, tokenVersion.ToString()),
    };
    // ...
}
```

On every request the version in the token is compared with the user's current version in the JWT scheme's `OnTokenValidated`. If the version is stale or the user does not exist, the request gets a 401, and the frontend sends the user to the sign-in page:

```csharp
public static async Task OnTokenValidated(TokenValidatedContext context)
{
    var tokenVersionService = context.HttpContext.RequestServices.GetRequiredService<ITokenVersionService>();
    if (!await tokenVersionService.IsCurrent(context.Principal!, context.HttpContext.RequestAborted))
        context.Fail("The token was revoked.");
}
```

To avoid a database query per request, the current version is cached in memory for 30 seconds. Tokens issued before the claim existed count as version 0, so the sessions that were already open kept working after the release.

Linking increments the user's version in the same `UPDATE` that marks them deleted:

```csharp
await context.Users
    .Where(x => x.Id == previousOwnerId)
    .ExecuteUpdateAsync(x => x
        .SetProperty(u => u.DeletedAt, dateTimeProvider.UtcNow)
        .SetProperty(u => u.DeletedByUserId, userId)
        .SetProperty(u => u.TokenVersion, u => u.TokenVersion + 1),
        cancellationToken);
```

After the transaction commits, their version is removed from the cache, and on that host their sessions end at once. On other hosts they end when the cache entry expires, within 30 seconds. The cache sits behind an `ITokenVersionCache` interface so it can later be replaced by a shared one, Redis for example.

The alternative was short-lived access tokens with refresh tokens. That is a bigger change: a refresh endpoint, storing refresh tokens, refreshing the token in the frontend. The token version gave immediate revocation for less work. The same mechanism will be useful for signing out on all devices and for making the removal of a user from an organization take effect at once.

## Results

- **The Google ID token is verified in the backend.** The audience and the issuers are set explicitly: without them the library does not check those claims.
- **The user is looked up by `sub`, not by email.** Email can change.
- **A user has one Telegram and one Google account.** The second sign-in method is connected in the account settings.
- **An account is taken over only from an empty user.** What counts as data is listed explicitly; a conflict with data refuses the connection.
- **The gRPC call does not run inside a transaction.** Identity first, then a transaction in Boards; both steps can be repeated.
- **Concurrent connections are serialized with `SELECT ... FOR UPDATE`.** Rows are locked in id order.
- **A user left without a sign-in method is marked deleted and their tokens are revoked.** A token version in the JWT, a check in `OnTokenValidated`, a 30-second cache.

## What comes next

In this article soft delete reached users. The next article is about how we made soft delete work for every entity in Boards and what it changed in our unique indexes.
