import type { GetStaticProps, GetStaticPaths, NextPage } from "next"
import Head from "next/head"
import { api } from "~/utils/api"
import { createServerSideHelpers } from '@trpc/react-query/server'
import superjson from 'superjson'
import { appRouter } from "~/server/api/root"
import { prisma } from "~/server/db"
import { PageLayout } from "~/components/layout"
import Image from "next/image"

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
    const { data, isLoading } = api.profile.getUserByUsername.useQuery({ username })

    if (!data) return <div>404</div>
    
    return (<>
        <Head>
            <title>Chirp | {data.username}</title>
        </Head>
        <PageLayout>
            <div className="h-36 border-slate-600 bg-slate-900 relative">
                <Image src={data.profileImageUrl} width={128} height={128} alt="profile pic" className="-mb-[64px] absolute bottom-0 left-0 ml-4 rounded-full border-8 border-black" />
            </div>
            <div className="h-[64px]"></div>
            <div className="px-8 py-4 text-2xl">{`@${data.username ?? ''}`}</div>
            <div className="border-b border-slate-600 w-full"></div>
        </PageLayout>
    </>)
}

export const getStaticProps: GetStaticProps = async (context) => {
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { prisma, userId: null },
        transformer: superjson, // optional - adds superjson serialization
    })

    const slug = context.params?.slug

    if (typeof slug !== 'string') {
        throw new Error('no slug')
    }

    const username = slug.replace('@', '')

    await helpers.profile.getUserByUsername.prefetch({ username })

    return {
        props: {
            trpcState: helpers.dehydrate(),
            username
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

export default ProfilePage
