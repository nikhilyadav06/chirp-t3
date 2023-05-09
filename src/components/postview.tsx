import Image from "next/image"
import Link from "next/link"
import type { RouterOutputs } from "~/utils/api"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

type PostWithUser = RouterOutputs["posts"]["getAll"][number]
export const PostView = (props: PostWithUser) => {
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