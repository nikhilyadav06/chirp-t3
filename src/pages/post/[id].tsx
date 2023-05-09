import type { GetStaticProps, GetStaticPaths, NextPage } from "next"
import Head from "next/head"
import { api } from "~/utils/api"
import { PageLayout } from "~/components/layout"
import { PostView } from "~/components/postview"
import { generateServerSideHelpers } from "~/server/helpers/ssgHelper"

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
    const { data, isLoading } = api.posts.getById.useQuery({ id })

    if (!data) return <div>404</div>
    
    return (<>
        <Head>
            <title>Chirp | {data.post.content} | {data.author.username}</title>
        </Head>
        <PageLayout>
            <PostView {...data} />
        </PageLayout>
    </>)
}

export const getStaticProps: GetStaticProps = async (context) => {
    const helpers = generateServerSideHelpers()

    const id = context.params?.id

    if (typeof id !== 'string') {
        throw new Error('no id')
    }

    await helpers.posts.getById.prefetch({ id })

    return {
        props: {
            trpcState: helpers.dehydrate(),
            id
        },
        revalidate: 1
    }
}

export const getStaticPaths: GetStaticPaths = () => {
    return {
        paths: [],
        fallback: 'blocking'
    }
}

export default SinglePostPage
