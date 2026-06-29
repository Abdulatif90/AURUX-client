import { serverSideTranslations } from 'next-i18next/serverSideTranslations'; 



export const getStaticProps = async ({ locale }: any) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common'])),
    },
});
