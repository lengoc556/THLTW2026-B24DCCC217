import React, { useState } from 'react';
import { InputNumber, Button, Typography, Alert, Space } from 'antd';

const { Title, Paragraph } = Typography;

export default function GuessingGame() {
  const [secretNumber] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [attempts, setAttempts] = useState(0);
  const [guess, setGuess] = useState(null);
  const [message, setMessage] = useState('');
  const [finished, setFinished] = useState(false);

  const maxAttempts = 10;

  const handleGuess = () => {
    if (finished) return;

    if (guess === null) {
      setMessage('⚠️ Vui lòng nhập số!');
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (guess < secretNumber) {
      setMessage('👉 Bạn đoán quá thấp!');
    } else if (guess > secretNumber) {
      setMessage('👆 Bạn đoán quá cao!');
    } else {
      setMessage('🎉 Chúc mừng! Bạn đã đoán đúng!');
      setFinished(true);
      return;
    }

    if (newAttempts >= maxAttempts && guess !== secretNumber) {
      setMessage(`❌ Bạn đã hết lượt! Số đúng là ${secretNumber}`);
      setFinished(true);
    }
  };

  const resetGame = () => {
    window.location.reload(); // đơn giản: reload để sinh số mới
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>🎮 Trò chơi đoán số</Title>
      <Paragraph>
        Hệ thống đã chọn một số ngẫu nhiên từ <b>1 đến 100</b>. Bạn có <b>{maxAttempts}</b> lượt để đoán.
      </Paragraph>

      <Space direction="vertical" size="middle">
        <InputNumber
          min={1}
          max={100}
          value={guess}
          onChange={(val) => setGuess(val)}
          disabled={finished}
          placeholder="Nhập số bạn đoán"
        />
        <Button type="primary" onClick={handleGuess} disabled={finished}>
          Đoán
        </Button>
        {message && <Alert message={message} type="info" showIcon />}
        {finished && (
          <Button onClick={resetGame} style={{ marginTop: 12 }}>
            Chơi lại
          </Button>
        )}
        <Paragraph>Lượt đã dùng: {attempts}/{maxAttempts}</Paragraph>
      </Space>
    </div>
  );
}
