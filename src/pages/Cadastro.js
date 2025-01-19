import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../estilos/Cadastro.css';
import Alert from '../components/Alert';

const Cadastro = () => {
  const location = useLocation();

  const [numbersFromUrl, setNumbersFromUrl] = useState([]);
  const [uuid, setUuid] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const pathSegments = location.pathname.split('/').slice(2);
    const extractedUuid = pathSegments[0];
    localStorage.setItem('cadastroUUID', extractedUuid);
    setUuid(extractedUuid);

    const numbers = pathSegments.slice(1).map(segment => parseInt(segment, 10)).filter(num => !isNaN(num));
    localStorage.setItem('cadastroNumbers', JSON.stringify(numbers));
    setNumbersFromUrl(numbers);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    const requestBody = {
      RegisterDate: new Date().toISOString().split('T')[0],
      PersonName: "Alguem", // Valor fixo para o nome
      Cpf: "44134412811", // Valor fixo para o CPF
      Phone: "5511999999999", // Valor fixo para o telefone
      BirthDate: "01/01/2000", // Valor fixo para a data de nascimento
      Mail: "default@example.com", // Valor fixo para o e-mail
      HasAcceptedParticipation: true, // Valor fixo indicando aceitação dos termos
      ImageIds: numbersFromUrl.map((num) => `${num}.png`),
      AuthenticationId: uuid,
      HasAcceptedPromotion: true, // Valor fixo indicando aceitação de promoções
    };

    console.log('Request Body:', requestBody);

    try {
      const response = await fetch('http://18.231.212.243:3333/Person/Person', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'imagem.png'; // Nome do arquivo
        a.click();
        window.URL.revokeObjectURL(url);

        setAlert({ message: 'Cadastro enviado e imagem baixada com sucesso!', type: 'success' });
      } else if (response.status === 422) {
        const errorData = await response.json();
        const errorMessage = errorData.Errors ? errorData.Errors.join(', ') : 'Erro desconhecido';
        setAlert({ message: errorMessage, type: 'error' });
      } else {
        setAlert({ message: 'Erro ao enviar o cadastro. Por favor, tente novamente.', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: `Erro de rede: ${error.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const closeAlert = () => setAlert({ message: '', type: '' });

  return (
    <div className="container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo-image" />
      </div>
      <div className="form-container">
        <h1 className="form-title">Baixe a sua imagem</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <button type="submit" className="submit-button">
            BAIXAR
          </button>
        </form>

        {alert.message && (
          <Alert message={alert.message} type={alert.type} onClose={closeAlert} />
        )}
      </div>
    </div>
  );
};

export default Cadastro;
