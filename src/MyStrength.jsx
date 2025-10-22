import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MyStrength.css';

export default function MyStrength() {
  const navigate = useNavigate(); // ✅ 추가

  const top5 = ['#내적동기', '#감성', '#창의적 사고', '#의사소통', '#자기관리'];
  const another10 = [
    '#복합적 문제해결', '#글로벌 마인드', '#자기효능', '#지식정보활용', '#리더쉽',
    '#윤리의식', '#비판적 사고', '#협업', '#프레젠테이션', '#자원 관리 능력'
  ];

  const handleNext = () => {
    navigate('/addexperience'); // ✅ 클릭 시 페이지 이동
  };

  return (
    <div className="strength-container">
      <h1 className="strength-title">내 강점</h1>

      <div className="section">
        <h2 className="subtitle">Top 5</h2>
        <div className="tags">
          {top5.map((tag, i) => (
            <span key={i} className="tag-bright">{tag}</span>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="subtitle">Another 10</h2>
        <div className="tags">
          {another10.map((tag, i) => (
            <span key={i} className="tag-dim">{tag}</span>
          ))}
        </div>
      </div>

      <button className="next-btn" onClick={handleNext}>NEXT</button>
    </div>
  );
}
