import React, { useState } from 'react';
import { Button, Space, Typography, List, Tag } from 'antd';

const { Title } = Typography;

const choices = ['Kéo', 'Búa', 'Bao'];

function getResult(player, computer) {
  if (player === computer) return 'Hòa';
  if (
    (player === 'Kéo' && computer === 'Bao') ||
    (player === 'Búa' && computer === 'Kéo') ||
    (player === 'Bao' && computer === 'Búa')
  ) {
    return 'Thắng';
  }
  return 'Thua';
}

export default function RockPaperScissors() {
  const [history, setHistory] = useState([]);

  const play = (playerChoice) => {
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    const result = getResult(playerChoice, computerChoice);
    const round = {
      id: Date.now(),
      player: playerChoice,
      computer: computerChoice,
      result,
    };
    setHistory((prev) => [round, ...prev]);
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>✊✋✌️ Trò chơi Oẳn Tù Tì</Title>
      <Space style={{ marginBottom: 16 }}>
        {choices.map((c) => (
          <Button key={c} type="primary" onClick={() => play(c)}>
            {c}
          </Button>
        ))}
      </Space>

      <List
        header={<b>Lịch sử ván đấu</b>}
        bordered
        dataSource={history}
        renderItem={(item, idx) => (
          <List.Item>
            Ván {history.length - idx}: Bạn chọn <Tag color="blue">{item.player}</Tag>, 
            Máy chọn <Tag color="red">{item.computer}</Tag> → 
            <b>{item.result}</b>
          </List.Item>
        )}
      />
    </div>
  );
}
