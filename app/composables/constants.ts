export const useConstants = () => {

    const AUTHOR = {
        name: "Belyansky Ilya",
        url: "https://www.linkedin.com/in/ilya-belyanskiy"
    }

    // The publisher of the blog: it is shown in the structured data of the articles.
    const PUBLISHER = {
        "@type": "Organization",
        name: "Laraue",
        url: "https://laraue.com",
        logo: "https://laraue.com/static/images/icons/laraue-apple-touch-icon-black.png"
    }

    return {
        author: AUTHOR,
        publisher: PUBLISHER
    }
}
