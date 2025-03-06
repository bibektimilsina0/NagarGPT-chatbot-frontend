'use server'
export async function createPost(formData){
    const name=formData.get('name')
    const title=formData.get('title')
    const file=formData.get('image')
    console.log(name,title,file)
    if (!file) {
        console.error("No file uploaded");
        return;
    }

    // Read the file as a Buffer (for backend storage, e.g., S3, Cloudinary)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("Received file:", file.name);
    console.log("File size:", file.size);

    // Example: Upload to Cloudinary / S3 (You need to implement this)
    // await uploadToS3(buffer, file.type); 

    return { success: true, message: "Post created!" };
}