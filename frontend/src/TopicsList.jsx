// src/TopicsList.jsx
import React, { useState, useEffect } from 'react';
import TopicView from './TopicView'; // Импортируем новый компонент для просмотра топика

const TopicsList = ({ subThemeId, subThemeTitle, onBack }) => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Состояния для модального окна создания топика
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [newTopicContent, setNewTopicContent] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createMessage, setCreateMessage] = useState({ type: '', text: '' }); // { type: 'error' | 'success', text: '...' }

    // Состояние для управления отображением: список топиков или просмотр конкретного топика
    const [selectedTopic, setSelectedTopic] = useState(null);

    // Функция для получения топиков
    const fetchTopics = async () => {
        if (!subThemeId) {
            setError('ID подтемы не указан.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            // Замените URL на правильный путь к вашему API
            const response = await fetch(`http://localhost:8080/api/themes/subthemes/${subThemeId}/topics`);
            console.log(`Fetching topics for subtheme ID: ${subThemeId}`, response.status);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}. Message: ${errorText || 'Unknown error'}`);
            }

            const data = await response.json();
            console.log('Fetched topics:', data);
            setTopics(data);
        } catch (err) {
            console.error('Fetch error (Topics):', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // useEffect для загрузки топиков при изменении subThemeId
    useEffect(() => {
        fetchTopics();
    }, [subThemeId]);

    // Функция для обработки отправки формы создания топика
    const handleCreateTopic = async (e) => {
        e.preventDefault();

        if (!newTopicTitle.trim()) {
            setCreateMessage({ type: 'error', text: 'Заголовок топика не может быть пустым.' });
            return;
        }

        setIsCreating(true);
        setCreateMessage({ type: '', text: '' }); // Сброс сообщений

        try {
            // Замените URL на правильный путь к вашему API
            const response = await fetch('http://localhost:8080/api/themes/subthemes/topics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // Добавить после реализации аутентификации
                },
                body: JSON.stringify({
                    title: newTopicTitle,
                    content: newTopicContent,
                    sub_theme_id: parseInt(subThemeId, 10) // Убедиться, что это число
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Topic created:', data);
                setCreateMessage({ type: 'success', text: 'Топик успешно создан!' });
                setNewTopicTitle('');
                setNewTopicContent('');
                fetchTopics(); // Обновляем список топиков
                // Автоматически закрыть модальное окно через 1.5 секунды
                setTimeout(() => {
                    setIsCreateModalOpen(false);
                    setCreateMessage({ type: '', text: '' }); // Сброс сообщения при закрытии
                }, 1500);
            } else {
                console.error('Error creating topic:', data);
                setCreateMessage({ type: 'error', text: data.error || `Ошибка создания топика: ${response.status} ${response.statusText}` });
            }
        } catch (err) {
            console.error('Network error creating topic:', err);
            setCreateMessage({ type: 'error', text: 'Не удалось подключиться к серверу. Попробуйте позже.' });
        } finally {
            setIsCreating(false);
        }
    };

    // Функции управления модальным окном
    const openCreateModal = () => {
        setIsCreateModalOpen(true);
        setCreateMessage({ type: '', text: '' }); // Сброс сообщений при открытии
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        setNewTopicTitle('');
        setNewTopicContent('');
        setCreateMessage({ type: '', text: '' }); // Сброс сообщений при закрытии
    };

    // Функция для перехода к отображению конкретного топика
    const handleViewTopic = (topic) => {
        setSelectedTopic(topic);
    };

    // Функция для возврата к списку топиков
    const handleBackToTopics = () => {
        setSelectedTopic(null);
    };

    // Если выбран конкретный топик, отображаем TopicView
    if (selectedTopic) {
        return (
            <TopicView
                topicId={selectedTopic.id}
                topicTitle={selectedTopic.title}
                onBack={handleBackToTopics}
            />
        );
    }

    if (!subThemeId) {
        return <div className="content-area"><p>Ошибка: Не выбрана подтема для отображения топиков.</p></div>;
    }

    if (loading && topics.length === 0) return <div className="content-area"><p>Загрузка топиков для "{subThemeTitle}"...</p></div>;
    if (error) return (
        <div className="content-area">
            <button className="back-button" onClick={onBack}>Назад</button>
            <p style={{ color: 'red' }}>Ошибка загрузки топиков: {error}</p>
        </div>
    );

    return (
        <div className="content-area topics-content">
            <button className="back-button" onClick={onBack}>Назад</button>
            <div className="topics-header">
                <h2>Топики в подтеме: "{subThemeTitle}"</h2>
            </div>

            {loading && topics.length > 0 && <p>Обновление списка топиков...</p>}
            {topics.length > 0 ? (
                <div className="topics-list">
                    {topics.map((topic) => (
                        <div key={topic.id} className="topic-item">
                            {/* Делаем заголовок кликабельным для перехода к просмотру топика */}
                            <h3
                                className="topic-title"
                                onClick={() => handleViewTopic(topic)}
                            >
                                {topic.title}
                            </h3>
                            {topic.content && (
                                <p className="topic-content-preview">
                                    {topic.content.substring(0, 100)}{topic.content.length > 100 ? '...' : ''}
                                </p>
                            )}
                            <div className="topic-meta">
                                <span className="topic-author">Автор: User#{topic.author_id}</span>
                                <span className="topic-date">
                                    Создан: {new Date(topic.created_at).toLocaleString()}
                                </span>
                                {/* Отображаем количество постов, если оно приходит от сервера */}
                                {topic.post_count !== undefined && (
                                    <span className="topic-post-count">
                                        Сообщений: {topic.post_count}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>В этой подтеме пока нет топиков. Создайте первый!</p>
            )}

            {/* Плавающая кнопка создания топика */}
            <button className="floating-create-btn" onClick={openCreateModal} title="Создать новый топик">
                +
            </button>

            {/* Модальное окно создания топика */}
            {isCreateModalOpen && (
                <div className="modal-overlay" onClick={closeCreateModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Создать новый топик в "{subThemeTitle}"</h2>
                            <button className="close-modal-btn" onClick={closeCreateModal}>&times;</button>
                        </div>
                        {createMessage.text && (
                            <div className={`modal-message ${createMessage.type}`}>
                                {createMessage.text}
                            </div>
                        )}
                        <form onSubmit={handleCreateTopic} className="create-form">
                            <div className="form-group">
                                <label htmlFor="modal-new-topic-title">Заголовок топика:</label>
                                <input
                                    type="text"
                                    id="modal-new-topic-title"
                                    value={newTopicTitle}
                                    onChange={(e) => setNewTopicTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="modal-new-topic-content">Содержание (опционально):</label>
                                <textarea
                                    id="modal-new-topic-content"
                                    value={newTopicContent}
                                    onChange={(e) => setNewTopicContent(e.target.value)}
                                    rows="4"
                                />
                            </div>
                            <button
                                type="submit"
                                className="create-submit-btn"
                                disabled={isCreating}
                            >
                                {isCreating ? 'Создание...' : 'Создать топик'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopicsList;