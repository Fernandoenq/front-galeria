import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../estilos/Cadastro.css';
import Alert from '../components/Alert';
import { formatPhoneNumber } from '../utils/validators'; // Ajuste o caminho conforme necessário

const Cadastro = () => {
  const location = useLocation();

  const [numbersFromUrl, setNumbersFromUrl] = useState([]);
  const [uuid, setUuid] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    PersonName: '',
    Phone: '',
  });
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  useEffect(() => {
    const pathSegments = location.pathname.split('/').slice(2);
    const extractedUuid = pathSegments[0];
    localStorage.setItem('cadastroUUID', extractedUuid);
    setUuid(extractedUuid);

    const numbers = pathSegments.slice(1).map(segment => parseInt(segment, 10)).filter(num => !isNaN(num));
    localStorage.setItem('cadastroNumbers', JSON.stringify(numbers));
    setNumbersFromUrl(numbers);
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'Phone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData({ ...formData, [name]: formattedPhone });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateFields = () => {
    const nameValid = /\w+/.test(formData.PersonName); // Verifica se há pelo menos uma letra ou número
    const phoneValid = /^\d{11}$/.test(formData.Phone.replace(/\D/g, '')); // Verifica se o telefone tem 11 dígitos
    setIsButtonEnabled(nameValid && phoneValid);
  };

  useEffect(() => {
    validateFields();
  }, [formData]);

  const handleSubmit = async (e, number) => {
    e.preventDefault();

    setIsLoading(true);

    const rawPhone = formData.Phone.replace(/\D/g, '');
    const formattedPhone = `55${rawPhone}`;

    const requestBody = {
      RegisterDate: new Date().toISOString().split('T')[0],
      PersonName: formData.PersonName,
      Phone: formattedPhone,
      Cpf: "44134412811",
      BirthDate: new Date().toISOString().split('T')[0],
      Mail: "default@example.com",
      HasAcceptedParticipation: true,
      ImageIds: [`${number}.png`],
      AuthenticationId: uuid,
      HasAcceptedPromotion: true,
    };

    console.log('Request Body:', requestBody);

    try {
      const response = await fetch('http://15.229.5.105:3333/Person/Person', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Obtendo o horário atual formatado
        const currentTime = new Date();
        const formattedTime = currentTime
          .toISOString()
          .replace(/[-:T]/g, '') // Remove caracteres indesejados
          .split('.')[0]; // Remove milissegundos

        const a = document.createElement('a');
        a.href = url;
        a.download = `imagem_${formattedTime}.png`;
        a.click();
        window.URL.revokeObjectURL(url);

        setAlert({ message: `Imagem ${number} baixada com sucesso!`, type: 'success' });
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
        <h1 className="form-title">Baixe suas imagens</h1>

        <div className="user-info">
          <div>
            <input
              type="text"
              id="personName"
              name="PersonName"
              value={formData.PersonName}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Digite seu nome"
              required
            />
          </div>
          <div>
            <input
              type="tel"
              id="phone"
              name="Phone"
              value={formData.Phone}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Digite seu telefone"
              required
            />
          </div>
        </div>

        <div className="button-list">
          {numbersFromUrl.map((number, index) => (
            <form
              key={index}
              onSubmit={(e) => handleSubmit(e, number)}
              className="space-y-6 form-block"
            >
              <button
                type="submit"
                className={`submit-button ${isButtonEnabled ? 'enabled' : 'disabled'}`}
                disabled={!isButtonEnabled} // Botão desativado se os campos forem inválidos
              >
                BAIXAR {index + 1} {/* Sequência separada usando o índice do map */}
              </button>
            </form>
          ))}
        </div>




        {alert.message && (
          <Alert message={alert.message} type={alert.type} onClose={closeAlert} />
        )}
      </div>
    </div>
  );
};

export default Cadastro;
