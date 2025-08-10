// src/TopicView.jsx
import React, { useState, useEffect } from 'react';

// Компонент для отображения конкретного топика и работы с сообщениями
const TopicView = ({ topicId, topicTitle, topicContent, onBack }) => {
    // const [topicDetails, setTopicDetails] = useState(null); // Не используется, данные передаются пропсами
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Состояния для формы отправки нового сообщения
    const [newPostContent, setNewPostContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendMessage, setSendMessage] = useState({ type: '', text: '' }); // { type: 'error' | 'success', text: '...' }

    // Функция для получения сообщений топика
    const fetchPosts = async () => {
        if (!topicId) {
            setError('ID топика не указан.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            // Замените URL на правильный путь к вашему API
            const response = await fetch(`http://localhost:8080/api/themes/subthemes/topics/${topicId}/posts`);
            console.log(`Fetching posts for topic ID: ${topicId}`, response.status);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}. Message: ${errorText || 'Unknown error'}`);
            }

            const data = await response.json();
            console.log('Fetched posts:', data);
            // Проверим структуру первого элемента для отладки
            if (data.length > 0) {
                console.log('Структура первого поста:', data[0]);
            }
            setPosts(data);
        } catch (err) {
            console.error('Fetch error (Posts):', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // useEffect для загрузки сообщений при изменении topicId
    useEffect(() => {
        fetchPosts();
    }, [topicId]);

    // Функция для обработки отправки формы нового сообщения
    const handleSendPost = async (e) => {
        e.preventDefault();

        if (!newPostContent.trim()) {
            setSendMessage({ type: 'error', text: 'Сообщение не может быть пустым.' });
            return;
        }

        setIsSending(true);
        setSendMessage({ type: '', text: '' }); // Сброс сообщений

        try {
            // Замените URL на правильный путь к вашему API
            const response = await fetch('http://localhost:8080/api/themes/subthemes/topics/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // Добавить после реализации аутентификации
                },
                body: JSON.stringify({
                    content: newPostContent,
                    topic_id: parseInt(topicId, 10) // Убедиться, что это число
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Post sent:', data);
                setSendMessage({ type: 'success', text: 'Сообщение отправлено!' });
                setNewPostContent(''); // Очищаем поле ввода
                fetchPosts(); // Обновляем список сообщений
                // Автоматически скрыть сообщение об успехе через 2 секунды
                setTimeout(() => {
                    setSendMessage({ type: '', text: '' });
                }, 2000);
            } else {
                console.error('Error sending post:', data);
                setSendMessage({ type: 'error', text: data.error || `Ошибка отправки сообщения: ${response.status} ${response.statusText}` });
            }
        } catch (err) {
            console.error('Network error sending post:', err);
            setSendMessage({ type: 'error', text: 'Не удалось подключиться к серверу. Попробуйте позже.' });
        } finally {
            setIsSending(false);
        }
    };

    if (!topicId) {
        return <div className="content-area"><p>Ошибка: Не выбран топик для отображения.</p></div>;
    }

    if (loading && posts.length === 0) return <div className="content-area"><p>Загрузка обсуждения "{topicTitle}"...</p></div>;
    if (error) return (
        <div className="content-area">
            <button className="back-button" onClick={onBack}>Назад</button>
            <p style={{ color: 'red' }}>Ошибка загрузки сообщений: {error}</p>
        </div>
    );

    return (
        <div className="content-area topic-view-content">
            <button className="back-button" onClick={onBack}>Назад</button>

            <div className="topic-view-header">
                {/* Заголовок топика (вопрос) */}
                <h2>{topicTitle}</h2>

                {/* Содержание топика (описание), переданное как пропс */}
                {topicContent && (
                    <div className="topic-description">
                        {topicContent}
                    </div>
                )}
            </div>

            <div className="posts-section">
                <h3>Ответы</h3>
                {loading && posts.length > 0 && <p>Обновление ответов...</p>}
                {posts.length > 0 ? (
                    <div className="posts-list">
                        {posts.map((post, index) => (
                            <div key={post.id} className="post-item">
                                <div className="post-header">
                                    <span className="post-author">Пользователь #{post.author_id}</span>
                                    <span className="post-number">#{index + 1}</span>
                                    <span className="post-date">
                                        {new Date(post.created_at).toLocaleString()}
                                    </span>
                                </div>
                                {/* Отображаем содержание поста */}
                                <div className="post-content">
                                    {post.content} {/* Убедитесь, что поле называется 'content' в вашем API */}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Пока нет ответов. Будьте первым!</p>
                )}
            </div>

            <div className="send-post-section">
                <h3>Добавить ответ</h3>
                {sendMessage.text && (
                    <div className={`message ${sendMessage.type}`}>
                        {sendMessage.text}
                    </div>
                )}
                <form onSubmit={handleSendPost} className="send-post-form">
                    <div className="form-group">
                        <label htmlFor="new-post-content">Ваш ответ:</label>
                        <textarea
                            id="new-post-content"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            rows="4"
                            placeholder="Напишите ваш ответ..."
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="send-post-btn"
                        disabled={isSending}
                    >
                        {isSending ? 'Отправка...' : 'Отправить'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TopicView;