// src/SubThemesList.jsx
import React, { useState, useEffect } from 'react';

// Предполагаем, что этот компонент получает themeId как пропс
const SubThemesList = ({ themeId, themeTitle, onBack }) => {
    const [subThemes, setSubThemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Состояния для модального окна создания подтемы
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newSubThemeTitle, setNewSubThemeTitle] = useState('');
    const [newSubThemeStatus, setNewSubThemeStatus] = useState('Активна');
    const [isCreating, setIsCreating] = useState(false);
    const [createMessage, setCreateMessage] = useState({ type: '', text: '' });

    // Функция для получения подтем
    const fetchSubThemes = async () => {
        if (!themeId) {
            setError('ID темы не указан.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            // Замени URL на правильный путь к твоему API для получения подтем
            const response = await fetch(`http://localhost:8080/api/themes/${themeId}/subthemes`);
            console.log(`Fetching subthemes for theme ID: ${themeId}`, response.status);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}. Message: ${errorText || 'Unknown error'}`);
            }

            const data = await response.json();
            console.log('Fetched subthemes:', data);
            setSubThemes(data);
        } catch (err) {
            console.error('Fetch error (SubThemes):', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // useEffect для загрузки подтем при изменении themeId
    useEffect(() => {
        fetchSubThemes();
    }, [themeId]);

    // Функция для обработки отправки формы создания подтемы
    const handleCreateSubTheme = async (e) => {
        e.preventDefault();

        if (!newSubThemeTitle.trim()) {
            setCreateMessage({ type: 'error', text: 'Название подтемы не может быть пустым.' });
            return;
        }

        setIsCreating(true);
        setCreateMessage({ type: '', text: '' }); // Сброс сообщений

        try {
            // Замени URL на правильный путь к твоему API для создания подтемы
            const response = await fetch('http://localhost:8080/api/themes/subthemes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // Если нужно
                },
                body: JSON.stringify({
                    title: newSubThemeTitle,
                    status: newSubThemeStatus,
                    parent_id: themeId // Отправляем ID родительской темы
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('SubTheme created:', data);
                setCreateMessage({ type: 'success', text: 'Подтема успешно создана!' });
                setNewSubThemeTitle('');
                setNewSubThemeStatus('Активна');
                fetchSubThemes(); // Обновляем список подтем
                // Автоматически закрыть модальное окно через 1.5 секунды
                setTimeout(() => {
                    setIsCreateModalOpen(false);
                    setCreateMessage({ type: '', text: '' }); // Сброс сообщения при закрытии
                }, 1500);
            } else {
                console.error('Error creating subtheme:', data);
                setCreateMessage({ type: 'error', text: data.error || `Ошибка создания подтемы: ${response.status} ${response.statusText}` });
            }
        } catch (err) {
            console.error('Network error creating subtheme:', err);
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
        setNewSubThemeTitle('');
        setNewSubThemeStatus('Активна');
        setCreateMessage({ type: '', text: '' }); // Сброс сообщений при закрытии
    };

    if (!themeId) {
        return <div className="content-area"><p>Ошибка: Не выбрана тема для отображения подтем.</p></div>;
    }

    if (loading && subThemes.length === 0) return <div className="content-area"><p>Загрузка подтем для "{themeTitle}"...</p></div>;
    if (error) return (
        <div className="content-area">
            <button className="back-button" onClick={onBack}>Назад</button>
            <p style={{ color: 'red' }}>Ошибка загрузки подтем: {error}</p>
        </div>
    );

    return (
        <div className="content-area subthemes-content">
            <button className="back-button" onClick={onBack}>Назад</button>
            <div className="subthemes-header">
                <h2>Подтемы: "{themeTitle}"</h2>
            </div>

            {loading && subThemes.length > 0 && <p>Обновление списка подтем...</p>}
            {subThemes.length > 0 ? (
                <div className="subthemes-grid">
                    {subThemes.map((subTheme) => (
                        <div key={subTheme.id} className="subtheme-card">
                            <div className="subtheme-title">{subTheme.title}</div>
                            <div className={`subtheme-status ${subTheme.status === 'Активна' ? '' : 'inactive'}`}>
                                {subTheme.status}
                            </div>
                            {subTheme.created_at && (
                                <div className="subtheme-date">
                                    Создано: {new Date(subTheme.created_at).toLocaleDateString()}
                                </div>
                            )}
                            {/* Здесь можно добавить кликабельность для перехода к сообщениям подтемы */}
                            {/* <button className="view-posts-btn">Сообщения</button> */}
                        </div>
                    ))}
                </div>
            ) : (
                <p>Подтемы не найдены.</p>
            )}

            {/* Плавающая кнопка создания подтемы */}
            <button className="floating-create-btn" onClick={openCreateModal} title="Создать новую подтему">
                +
            </button>

            {/* Модальное окно создания подтемы */}
            {isCreateModalOpen && (
                <div className="modal-overlay" onClick={closeCreateModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Создать новую подтему для "{themeTitle}"</h2>
                            <button className="close-modal-btn" onClick={closeCreateModal}>&times;</button>
                        </div>
                        {createMessage.text && (
                            <div className={`modal-message ${createMessage.type}`}>
                                {createMessage.text}
                            </div>
                        )}
                        <form onSubmit={handleCreateSubTheme} className="create-form">
                            <div className="form-group">
                                <label htmlFor="modal-new-subtheme-title">Название подтемы:</label>
                                <input
                                    type="text"
                                    id="modal-new-subtheme-title"
                                    value={newSubThemeTitle}
                                    onChange={(e) => setNewSubThemeTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="modal-new-subtheme-status">Статус:</label>
                                <select
                                    id="modal-new-subtheme-status"
                                    value={newSubThemeStatus}
                                    onChange={(e) => setNewSubThemeStatus(e.target.value)}
                                >
                                    <option value="Активна">Активна</option>
                                    <option value="Архивирована">Архивирована</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="create-submit-btn"
                                disabled={isCreating}
                            >
                                {isCreating ? 'Создание...' : 'Создать подтему'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubThemesList;