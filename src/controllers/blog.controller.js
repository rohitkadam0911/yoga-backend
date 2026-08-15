import mongoose from "mongoose";
import Blog from "../models/blog.model.js";
import cloudinary from "../config/cloudinary.js";
import {uploadToCloudinary} from "../utils/uploadToCloudinary.js";


export const createBlog = async (req, res) => {
    try {
        const {
            title,
            description,
            content,
            category
        } = req.body;

        let thumbnail = {
            public_id: null,
            url: null
        };

        if (req.file) {
            const result = await uploadToCloudinary(
                req.file.buffer,
                "YogaConnect/Blog"
            );

            thumbnail = {
                public_id: result.public_id,
                url: result.secure_url
            };

        }

        const blog = await Blog.create({
            authorId: req.user.id,
            title,
            description,
            content,
            category,
            thumbnail
        });

        const populatedBlog = await Blog.findById(blog._id)
            .populate(
                "authorId",
                "name email role profileImage"
            );

        return res.status(201).json({
            success: true,
            message: "Blog created successfully",
            data: populatedBlog
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllBlogs = async (req, res) => {
    try {
        
        const blogs = await Blog.find({
            status: true
        })

        .populate(
            "authorId",
            "name role profileImage"
        )
        .sort({createdAt: -1});

        return res.status(200).json({
            success: true,
            count: blogs.length,
            data: blogs
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID"
            });
        }

        const blog = await Blog.findById(id)
            .populate(
                "authorId",
                "name email role profileImage"
            );

        if(!blog || !blog.status) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Blog fetched successfully",
            data: blog
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateBlog = async (req, res) => {
    try {
        
        const {id} = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success: false,
                message: "Invalid blog Id"
            });
        }

        const blog = await Blog.findById(id);

        if(!blog || !blog.status){
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        if (
            req.user.role === "instructor" && 
            blog.authorId.toString() !== req.user.id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You can update only your own blogs"
            });
        }

        const  {
            title,
            description,
            content,
            category
        } = req.body;

        blog.title = title ?? blog.title;
        blog.description = description ?? blog.description;
        blog.content = content ?? blog.content;
        blog.category = category ?? blog.category;

        if( req.file) {
            
            if (blog.thumbnail ?.public_id) {
                await cloudinary.uploader.destroy(
                    blog.thumbnail.public_id
                );
            }

            const result = await uploadToCloudinary(
                req.file.buffer,
                "YogaConnect/Blog"
            );

            blog.thumbnail = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }

        await blog.save();

        const updateBlog = await Blog.findById(blog._id) 
            .populate(
                "authorId",
                "name email role profileImage"
            );

        return res.status(200).json({
            success: true,
            message: "Blog updated successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const {id} = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID"
            });
        }

        const blog = await Blog.findById(id);

        if (!blog || !blog.status) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        if (
            req.user.role === "instructor" &&
            blog.authorId.toString() !== req.user.id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You can delete only your own blogs"
            });
        }

        blog.status = false;

        await blog.save();

        return res.status(200).json({
            success: true,
            message: "Blog deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};