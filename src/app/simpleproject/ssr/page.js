import { createPost } from "@/app/lib/action";
import { Suspense } from 'react'
export default async function SSR() {
    const data = await fetch("https://api.vercel.app/blog",{next: { revalidate: 20 }});
    const posts = await data.json();

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
            {/* Blog List */}
            <Suspense fallback={<p>Loading feed...</p>}>
            <h2 className="text-xl font-bold mb-4 text-center">Blog Posts</h2>
            <ul className="space-y-2 mb-6">
                {posts.map((post) => (
                    <li 
                        key={post.id} 
                        className="p-3 bg-gray-100 rounded-md shadow-sm"
                    >
                        {post.title}
                    </li>
                ))}
            </ul>
            </Suspense>
            {/* Form Section */}
            <h2 className="text-lg font-semibold mb-3 text-center">Create a Post</h2>
            <form action={createPost} className="space-y-4 bg-gray-50 p-6 rounded-lg shadow">
                <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300 outline-none"
                    required
                />
                <input
                    type="text"
                    name="title"
                    placeholder="Post Title"
                    className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300 outline-none"
                    required
                />
                <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="w-full p-2 border rounded-md"
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                >
                    Create Post
                </button>
            </form>
        </div>
    );
}
