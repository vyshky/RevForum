// src/UserTable.jsx
import React, { useState, useEffect } from 'react';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setError(null);
      setLoading(true);

      try {
        const response = await fetch('http://localhost:8080/api/users'); // Убедись, что URL правильный
        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response body:', errorText);
          throw new Error(`HTTP error! status: ${response.status}. Message: ${errorText || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('Fetched users:', data); // Проверь эту консоль, чтобы увидеть точную структуру
        setUsers(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="content-area"><p>Загрузка пользователей...</p></div>;
  if (error) return <div className="content-area"><p>Ошибка загрузки: {error}</p></div>;

  return (
    <div className="content-area">
      <h2>Список пользователей</h2>
      {users.length > 0 ? (
        <table className="user-table">
          <thead>
            <tr>
              {/* Поля теперь совпадают с JSON от сервера */}
              <th>ID</th>
              <th>Имя пользователя</th>
              <th>Email</th>
              <th>Дата регистрации</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.ID}> {/* Также используем правильное имя поля для key */}
                {/* Используем точные имена полей из JSON */}
                <td>{user.ID}</td>
                <td>{user.Username}</td>
                <td>{user.Email}</td>
                {/* GORM обычно сериализует time.Time в строку в формате RFC3339 */}
                <td>{user.CreatedAt ? new Date(user.CreatedAt).toLocaleString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Пользователи не найдены.</p>
      )}
    </div>
  );
};

export default UserTable;