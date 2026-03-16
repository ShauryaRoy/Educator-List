import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './index.css'; // Import the custom CSS file

const RATING_METRICS = [
    {
        key: 'teaching',
        label: 'Teaching',
        helper: 'How effective is the teaching?',
        column: 'teaching_rating',
    },
    {
        key: 'generousMarking',
        label: 'Generous marking',
        helper: '5 stars means more generous marking.',
        column: 'generous_marking_rating',
    },
    {
        key: 'lessAssignments',
        label: 'Less assignments',
        helper: '5 stars means fewer assignments.',
        column: 'less_assignments_rating',
    },
    {
        key: 'human',
        label: 'Human',
        helper: 'How kind and approachable as a human?',
        column: 'human_rating',
    },
];

const createEmptyRating = () =>
    RATING_METRICS.reduce((acc, metric) => {
        acc[metric.key] = 0;
        return acc;
    }, {});

const formatRating = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return '-';
    }

    return value.toFixed(1);
};

function TeacherList() {
    const [teachers, setTeachers] = useState([]);
    const [newComment, setNewComment] = useState({}); // Track comments for each teacher
    const [showComments, setShowComments] = useState({}); // Track which teacher's comments are visible
    const [searchQuery, setSearchQuery] = useState(''); // Search query state
    const [ratingDrafts, setRatingDrafts] = useState({});
    const [isSubmittingRating, setIsSubmittingRating] = useState({});

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const { data: teachersData, error: teachersError } = await supabase
                    .from('teachers')
                    .select('id, name, image_url')
                    .order('name', { ascending: true });

                if (teachersError) {
                    throw teachersError;
                }

                const teacherIds = (teachersData || []).map((teacher) => teacher.id);
                let commentsData = [];
                let ratingsData = [];

                if (teacherIds.length > 0) {
                    const { data: fetchedComments, error: commentsError } = await supabase
                        .from('comments')
                        .select('id, teacher_id, text, author, created_at')
                        .in('teacher_id', teacherIds)
                        .order('created_at', { ascending: true });

                    if (commentsError) {
                        throw commentsError;
                    }

                    commentsData = fetchedComments || [];

                    const { data: fetchedRatings, error: ratingsError } = await supabase
                        .from('ratings')
                        .select(
                            'id, teacher_id, teaching_rating, generous_marking_rating, less_assignments_rating, human_rating, created_at'
                        )
                        .in('teacher_id', teacherIds)
                        .order('created_at', { ascending: true });

                    if (ratingsError) {
                        throw ratingsError;
                    }

                    ratingsData = fetchedRatings || [];
                }

                const commentsByTeacher = commentsData.reduce((acc, comment) => {
                    if (!acc[comment.teacher_id]) {
                        acc[comment.teacher_id] = [];
                    }

                    acc[comment.teacher_id].push({
                        id: comment.id,
                        text: comment.text,
                        author: comment.author,
                        date: comment.created_at,
                    });

                    return acc;
                }, {});

                const mappedTeachers = (teachersData || []).map((teacher) => ({
                    _id: teacher.id,
                    name: teacher.name,
                    image_url: teacher.image_url,
                    comments: commentsByTeacher[teacher.id] || [],
                    ratings: [],
                    ratingSummary: {
                        count: 0,
                        teaching: null,
                        generousMarking: null,
                        lessAssignments: null,
                        human: null,
                        overall: null,
                    },
                }));

                const teacherMap = mappedTeachers.reduce((acc, teacher) => {
                    acc[teacher._id] = teacher;
                    return acc;
                }, {});

                ratingsData.forEach((rating) => {
                    const teacher = teacherMap[rating.teacher_id];
                    if (!teacher) {
                        return;
                    }

                    teacher.ratings.push(rating);
                });

                mappedTeachers.forEach((teacher) => {
                    const count = teacher.ratings.length;
                    if (count === 0) {
                        return;
                    }

                    const sums = teacher.ratings.reduce(
                        (acc, rating) => {
                            acc.teaching += rating.teaching_rating;
                            acc.generousMarking += rating.generous_marking_rating;
                            acc.lessAssignments += rating.less_assignments_rating;
                            acc.human += rating.human_rating;
                            return acc;
                        },
                        {
                            teaching: 0,
                            generousMarking: 0,
                            lessAssignments: 0,
                            human: 0,
                        }
                    );

                    const summary = {
                        count,
                        teaching: sums.teaching / count,
                        generousMarking: sums.generousMarking / count,
                        lessAssignments: sums.lessAssignments / count,
                        human: sums.human / count,
                    };

                    summary.overall =
                        (summary.teaching +
                            summary.generousMarking +
                            summary.lessAssignments +
                            summary.human) /
                        RATING_METRICS.length;

                    teacher.ratingSummary = summary;
                });

                setTeachers(mappedTeachers);
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
            const { data, error } = await supabase
                .from('comments')
                .insert({
                    teacher_id: teacherId,
                    text: commentText,
                    author: 'Anonymous',
                })
                .select('id, teacher_id, text, author, created_at')
                .single();

            if (error) {
                throw error;
            }

            const createdComment = {
                id: data.id,
                text: data.text,
                author: data.author,
                date: data.created_at,
            };

            // Update the teachers state with the new comment.
            const updatedTeachers = teachers.map((teacher) => {
                if (teacher._id === teacherId) {
                    return { ...teacher, comments: [...teacher.comments, createdComment] };
                }

                return teacher;
            });

            setTeachers(updatedTeachers);

            // Clear the comment input for the specific teacher.
            setNewComment((prev) => ({ ...prev, [teacherId]: '' }));
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

    const setMetricValue = (teacherId, metricKey, value) => {
        setRatingDrafts((prev) => ({
            ...prev,
            [teacherId]: {
                ...(prev[teacherId] || createEmptyRating()),
                [metricKey]: value,
            },
        }));
    };

    const renderStarsInput = (teacherId, metric) => {
        const currentValue = ratingDrafts[teacherId]?.[metric.key] || 0;

        return (
            <div key={metric.key} className="metric-row">
                <div className="metric-head">
                    <p>{metric.label}</p>
                    <span>{metric.helper}</span>
                </div>

                <div className="stars-input" role="radiogroup" aria-label={`${metric.label} rating`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className={`star-button ${star <= currentValue ? 'active' : ''}`}
                            onClick={() => setMetricValue(teacherId, metric.key, star)}
                            aria-label={`${metric.label} ${star} star${star > 1 ? 's' : ''}`}
                        >
                            ★
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const handleRatingSubmission = async (teacherId) => {
        const draft = ratingDrafts[teacherId] || createEmptyRating();
        const hasAnyUnselected = RATING_METRICS.some((metric) => !draft[metric.key]);

        if (hasAnyUnselected) {
            alert('Please give stars for all 4 metrics.');
            return;
        }

        setIsSubmittingRating((prev) => ({ ...prev, [teacherId]: true }));

        try {
            const payload = {
                teacher_id: teacherId,
                teaching_rating: draft.teaching,
                generous_marking_rating: draft.generousMarking,
                less_assignments_rating: draft.lessAssignments,
                human_rating: draft.human,
            };

            const { data, error } = await supabase
                .from('ratings')
                .insert(payload)
                .select(
                    'id, teacher_id, teaching_rating, generous_marking_rating, less_assignments_rating, human_rating, created_at'
                )
                .single();

            if (error) {
                throw error;
            }

            setTeachers((prev) =>
                prev.map((teacher) => {
                    if (teacher._id !== teacherId) {
                        return teacher;
                    }

                    const nextRatings = [...teacher.ratings, data];
                    const count = nextRatings.length;

                    const sums = nextRatings.reduce(
                        (acc, rating) => {
                            acc.teaching += rating.teaching_rating;
                            acc.generousMarking += rating.generous_marking_rating;
                            acc.lessAssignments += rating.less_assignments_rating;
                            acc.human += rating.human_rating;
                            return acc;
                        },
                        {
                            teaching: 0,
                            generousMarking: 0,
                            lessAssignments: 0,
                            human: 0,
                        }
                    );

                    const summary = {
                        count,
                        teaching: sums.teaching / count,
                        generousMarking: sums.generousMarking / count,
                        lessAssignments: sums.lessAssignments / count,
                        human: sums.human / count,
                    };

                    summary.overall =
                        (summary.teaching +
                            summary.generousMarking +
                            summary.lessAssignments +
                            summary.human) /
                        RATING_METRICS.length;

                    return {
                        ...teacher,
                        ratings: nextRatings,
                        ratingSummary: summary,
                    };
                })
            );

            setRatingDrafts((prev) => ({
                ...prev,
                [teacherId]: createEmptyRating(),
            }));
        } catch (error) {
            console.error('Cannot post rating:', error);
            alert('Could not submit rating. Please try again.');
        } finally {
            setIsSubmittingRating((prev) => ({ ...prev, [teacherId]: false }));
        }
    };

    // Filter teachers based on search query
    const filteredTeachers = teachers.filter((teacher) =>
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="page-shell">
            <header className="hero">
                <p className="eyebrow">Educator Directory</p>
                <h1>Find educators and share quick feedback</h1>
                <p className="hero-subtitle">
                    Browse the full list, rate each teacher on 4 metrics, and share concise comments.
                </p>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="result-count">{filteredTeachers.length} shown</span>
                </div>
            </header>

            <main className="container">
                {filteredTeachers.length === 0 ? (
                    <p className="loading">No teachers found.</p>
                ) : (
                    <div className="teachers-grid">
                        {filteredTeachers.map((teacher) => (
                            <article key={teacher._id} className="teacher-card">
                                <div className="teacher-head">
                                    <img src={teacher.image_url} alt={teacher.name} loading="lazy" />
                                    <div>
                                        <h2>{teacher.name}</h2>
                                        <p className="comment-meta">
                                            {teacher.comments.length} comment{teacher.comments.length === 1 ? '' : 's'}
                                        </p>
                                    </div>
                                </div>

                                <section className="ratings-panel">
                                    <div className="ratings-summary">
                                        <p>
                                            Overall <strong>{formatRating(teacher.ratingSummary.overall)}</strong>
                                            <span> / 5</span>
                                        </p>
                                        <span>{teacher.ratingSummary.count} rating(s)</span>
                                    </div>

                                    <div className="ratings-grid">
                                        <p>Teaching: {formatRating(teacher.ratingSummary.teaching)}</p>
                                        <p>Generous marking: {formatRating(teacher.ratingSummary.generousMarking)}</p>
                                        <p>Less assignments: {formatRating(teacher.ratingSummary.lessAssignments)}</p>
                                        <p>Human: {formatRating(teacher.ratingSummary.human)}</p>
                                    </div>
                                </section>

                                <section className="rate-form">
                                    <h3>Rate this teacher</h3>
                                    {RATING_METRICS.map((metric) => renderStarsInput(teacher._id, metric))}
                                    <button
                                        type="button"
                                        onClick={() => handleRatingSubmission(teacher._id)}
                                        disabled={isSubmittingRating[teacher._id]}
                                    >
                                        {isSubmittingRating[teacher._id] ? 'Submitting...' : 'Submit Rating'}
                                    </button>
                                </section>

                                <button
                                    className="toggle-comments-button"
                                    onClick={() => toggleComments(teacher._id)}
                                >
                                    {showComments[teacher._id] ? 'Hide Comments' : 'Show Comments'}
                                </button>

                                {showComments[teacher._id] && (
                                    <div className="comments-section">
                                        <h3>Comments</h3>
                                        <ul>
                                            {teacher.comments.map((comment) => (
                                                <li key={comment.id} className="comment">
                                                    <strong>{comment.author}</strong>
                                                    <p>{comment.text}</p>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="comment-form">
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
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default TeacherList;