import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css'; // Import the custom CSS file

function TeacherList() {
    const [teachers, setTeachers] = useState([]);
    const [newComment, setNewComment] = useState({}); // Track comments for each teacher
    const [showComments, setShowComments] = useState({}); // Track which teacher's comments are visible
    const [searchQuery, setSearchQuery] = useState(''); // Search query state

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await axios.get('http://localhost:3002/api/teachers');
                setTeachers(response.data);
            } catch (error) {
                console.error('Error fetching teachers:', error);
            }
        };
        fetchTeachers();
    }, []);

    const handleCommentSubmission = async (teacherId) => {
        const commentText = newComment[teacherId]?.trim();
        if (!commentText) {
            alert('Please enter a comment');
            return;
        }
        try {
            const response = await axios.post(
                `http://localhost:3002/api/teachers/${teacherId}/comments`,
                {
                    text: commentText,
                    author: 'Anonymous',
                }
            );
            if (response.status === 201) {
                // Update the teachers state with the new comment
                const updatedTeachers = teachers.map((teacher) => {
                    if (teacher._id === teacherId) {
                        return { ...teacher, comments: [...teacher.comments, response.data.comment] };
                    }
                    return teacher;
                });
                setTeachers(updatedTeachers);

                // Clear the comment input for the specific teacher
                setNewComment((prev) => ({ ...prev, [teacherId]: '' }));
            }
        } catch (error) {
            console.error('Cannot post the comment:', error);
        }
    };

    const toggleComments = (teacherId) => {
        setShowComments((prev) => ({
            ...prev,
            [teacherId]: !prev[teacherId], // Toggle visibility for the specific teacher
        }));
    };

    // Filter teachers based on search query
    const filteredTeachers = teachers.filter((teacher) =>
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container">
            <h1>Teachers List</h1>

            {/* Search Bar */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search teachers by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredTeachers.length === 0 ? (
                <p className="loading">No teachers found.</p>
            ) : (
                <div>
                    {filteredTeachers.map((teacher) => (
                        <div key={teacher._id} className="teacher-card">
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img src={teacher.image_url} alt={teacher.name} />
                                <h2>{teacher.name}</h2>
                            </div>

                            {/* Toggle Comments Button */}
                            <button
                                className="toggle-comments-button"
                                onClick={() => toggleComments(teacher._id)}
                            >
                                {showComments[teacher._id] ? 'Hide Comments' : 'Show Comments'}
                            </button>

                            {/* Comments Section */}
                            {showComments[teacher._id] && (
                                <div className="comments-section">
                                    <h3>Comments:</h3>
                                    <ul>
                                        {teacher.comments.map((comment, index) => (
                                            <li key={index} className="comment">
                                                <strong>{comment.author}</strong>: <p>{comment.text}</p>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Add Comment Section */}
                                    <div>
                                        <textarea
                                            value={newComment[teacher._id] || ''}
                                            onChange={(e) =>
                                                setNewComment((prev) => ({
                                                    ...prev,
                                                    [teacher._id]: e.target.value,
                                                }))
                                            }
                                            placeholder="Write a comment"
                                        />
                                        <button onClick={() => handleCommentSubmission(teacher._id)}>
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TeacherList;