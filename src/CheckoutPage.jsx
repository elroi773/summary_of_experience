import { useNavigate } from 'react-router-dom';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/my-strength');
  };

  return (
    <div className="checkout-container">
      {/* 메인 텍스트 */}
      <h1 className="checkout-title">경험정리 페이지</h1>

      {/* 버튼 */}
      <button onClick={handleClick} className="checkout-button">
        <span>→</span>
        <span>시작하기</span>
      </button>

      {/* 푸터 텍스트 */}
      <div className="checkout-footer">
        made by <span className="highlight">김이레</span>
      </div>
    </div>
  );
}
