module.exports = {
    output: "standalone",
    redirects: async () => {
        return [
            {
                source: "/",
                destination: "/dashboard",
                permanent: true,
            },
        ];
    },
};
