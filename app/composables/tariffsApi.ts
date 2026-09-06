import {useBillingClient} from "~/composables/billingClient";

export enum ServiceId {
    LaraueBoards = 'LaraueBoards',
    MarkdownTranslator = 'MarkdownTranslator',
}

export enum BillingPeriod {
    Month = 'Month',
    Forever = 'Forever',
}

export interface GetServiceTariffsRequest {
    serviceId: ServiceId;
    currencyCode: string;
}

export interface Subscription {
    title: string;
    price: number;
    currencyCode: string;
    formattedPrice: string;
    billingDuration?: number;
    billingPeriod: BillingPeriod;
}

export interface LaraueBoardsPersonalSubscription extends Subscription {
    type: 'LaraueBoardsPersonal';
    id: string;
    includedTokensCount: number;
    limitIssuesPerMonth?: number;
    limitFreeTeamOrganizationsCount?: number;
}

export interface MarkdownTranslatorPersonalSubscription extends Subscription {
    type: 'MarkdownTranslatorPersonal';
    id: string;
    includedTokensCount: number;
    includedDailyFreeTokensCount: number;
}

export type PersonalSubscription = LaraueBoardsPersonalSubscription | MarkdownTranslatorPersonalSubscription;

export interface LaraueBoardsTeamSubscription extends Subscription {
    type: 'LaraueBoardsTeam';
    id: string;
    includedTokensCount: number;
    limitIssuesPerMonth?: number;
}

export type TeamSubscription = LaraueBoardsTeamSubscription;

export interface GetServiceTariffsResponse {
    personalSubscriptions: PersonalSubscription[];
    teamSubscriptions: TeamSubscription[];
}

export const useTariffsApi = () => {
    const client = useBillingClient()

    const getServiceTariffs = async (request: GetServiceTariffsRequest): Promise<GetServiceTariffsResponse> => {
        return client<GetServiceTariffsResponse>('tariffs', {
            method: 'GET',
            query: request
        });
    }

    return {
        getServiceTariffs,
    }
}
