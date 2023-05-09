import { SignIn, SignInButton, UserButton, useUser } from "@clerk/nextjs"
import { type NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

import { api } from "~/utils/api"
import type { RouterOutputs } from "~/utils/api"
import Image from "next/image"
import { LoadingPage, LoadingSpinner } from "~/components/loading"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { PageLayout } from "~/components/layout"

dayjs.extend(relativeTime)

const CreatePostWizard = () => {
    const { user, isLoaded: userLoaded } = useUser()

    const [input, setInput] = useState('')

    const ctx = api.useContext()

    const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
        onSuccess: () => {
            setInput('')
            void ctx.posts.getAll.invalidate()
        },
        onError: (e) => {
            const errorMessage = e.data?.zodError?.fieldErrors.content
            if (errorMessage && errorMessage[0]) {
                toast.error(errorMessage[0])
            } else {
                toast.error("Failed to post, please try again later")
            }
        }
    })

    if (!user) return null

    return <div className="flex gap-4 w-full">
        {/* <UserButton /> */}
        <Image width={56} height={56} src={user.profileImageUrl} alt="" className="w-14 h-14 rounded-full" />
        <input
            type="text"
            placeholder="Type some emojis"
            className="bg-transparent grow outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault()
                    if (input !== '') {
                        mutate({ content: input })
                    }
                }
            }}
            disabled={isPosting}
        />
        {input !== '' && !isPosting && (
            <button onClick={() => mutate({ content: input })} disabled={isPosting}>Post</button>
        )}
        {isPosting && (
            <div className="flex justify-center items-center"><LoadingSpinner /></div>
        )}
    </div>
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number]
const PostView = (props: PostWithUser) => {
    const { post, author } = props

    return (
        <div key={post.id} className="p-4 border-b border-slate-800 flex gap-3">
            <Image width={56} height={56} src={author.profileImageUrl} alt="" className="w-14 h-14 rounded-full" />
            <div className="flex flex-col">
                <div className="flex text-cyan-200 gap-1">
                    <Link href={`/@${author.username}`}><span>{`@${author.username}`}</span></Link>
                    <Link href={`/post/${post.id}`}><span className="font-thin">{` • ${dayjs(post.createdAt).fromNow()}`}</span></Link>
                </div>
                <span className="text-2xl">{post.content}</span>
            </div>
        </div>
    )
}

const Feed = () => {
    const { data, isLoading: postLoading } = api.posts.getAll.useQuery()

    if (postLoading) return <LoadingPage />

    if (!data) return <div>Something went wrong</div>

    return (
        <div className="flex flex-col">
            {data?.map((fullPost) => (
                <PostView {...fullPost} key={fullPost.post.id} />
            ))}
        </div>
    )
}

const Home: NextPage = () => {
    const { isLoaded: userLoaded, isSignedIn } = useUser()

    api.posts.getAll.useQuery()

    if (!userLoaded) return <div />

    return (<>
        <PageLayout>
            <div className="border-b border-slate-600 p-4 flex justify-between items-center">
                {!isSignedIn && <div className="bg-slate-600 py-2 px-4 rounded">
                    <SignInButton />
                </div>}
                {isSignedIn && <CreatePostWizard />}
            </div>

            <Feed />
        </PageLayout>
    </>)
}

export default Home
