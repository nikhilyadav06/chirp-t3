import type { PropsWithChildren } from 'react'

export const PageLayout = (props: PropsWithChildren) => {
    return (
        <main className="flex justify-center h-screen">
            <div className="w-full md:max-w-2xl border-x border-slate-600 overflow-y-scroll">
                {props.children}
            </div>
        </main>
    )
}