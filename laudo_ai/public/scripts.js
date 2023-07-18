document.addEventListener('DOMContentLoaded', function() {
    let mediaRecorder;
    let chunks = [];
    let isRecording = false;
    let audioBlob = null;
  
    const btnGravar = document.getElementById('btnGravar');
    const btnParar = document.getElementById('btnParar');
    const btnReproduzir = document.getElementById('btnReproduzir');
    const btnEnviar = document.getElementById('btnEnviar');
    const colunaCentral = document.getElementById('coluna-central');
    const recordingIndicator = document.getElementById('recording-indicator');
  
    btnGravar.addEventListener('click', iniciarGravacao);
    btnParar.addEventListener('click', pararGravacao);
    btnReproduzir.addEventListener('click', reproduzirAudio);
    btnEnviar.addEventListener('click', executarScript);
  
    function iniciarGravacao() {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
          mediaRecorder = new MediaRecorder(stream);
  
          mediaRecorder.addEventListener('dataavailable', function(event) {
            chunks.push(event.data);
          });
  
          mediaRecorder.addEventListener('stop', function() {
            audioBlob = new Blob(chunks, { type: 'audio/wav' });
  
            // Enviar o áudio para o backend
            enviarAudio(audioBlob);
  
            chunks = [];
            isRecording = false;
            btnGravar.disabled = false;
            btnParar.disabled = true;
            btnReproduzir.disabled = false;
            recordingIndicator.style.display = 'none';
          });
  
          mediaRecorder.start();
          isRecording = true;
          btnGravar.disabled = true;
          btnParar.disabled = false;
          btnReproduzir.disabled = true;
          recordingIndicator.style.display = 'inline-block';
        })
        .catch(function(err) {
          console.log('Erro ao acessar o microfone: ', err);
        });
    }
  
    function pararGravacao() {
      mediaRecorder.stop();
      isRecording = false;
      btnGravar.disabled = false;
      btnParar.disabled = true;
      btnReproduzir.disabled = false;
      recordingIndicator.style.display = 'none';
    }
  
    function reproduzirAudio() {
      if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audioElement = new Audio(audioUrl);
        audioElement.play();
      }
    }
  
    function enviarAudio(blob) {
      const formData = new FormData();
      formData.append('audio', blob);
  
      fetch('/gravar-audio', {
        method: 'POST',
        body: formData
      })
      .then(response => response.blob())
      .then(blob => {
        audioBlob = blob;
        btnReproduzir.disabled = false;
      })
      .catch(error => {
        console.error('Erro ao enviar o áudio', error);
      });
    }
  
    function executarScript() {
        const modeloSelecionado = selectModelos.value;
      
        fetch('/enviar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ modelo: modeloSelecionado })
        })
          .then(response => {
            if (response.ok) {
              return response.json(); // Alterado para response.json()
            } else {
              throw new Error('Erro ao executar o script');
            }
          })
          .then(data => {
            colunaCentral.innerHTML = '<pre>' + data.output + '</pre>'; // Incluído <pre> para preservar a formatação
            console.log('Script executado com sucesso');
          })
          .catch(error => {
            console.error('Erro ao enviar a solicitação: ', error);
          });
      }
      
      
      



const selectModelos = document.createElement('select');
  const labelModelos = document.createElement('label');
  labelModelos.textContent = 'Modelos:';
  labelModelos.appendChild(selectModelos);
  const coluna2 = document.querySelector('th:nth-child(2)');
  coluna2.appendChild(labelModelos);

  fetch('/modelos')
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Erro ao obter a lista de modelos');
      }
    })
    .then(data => {
      const modelos = data.modelos;
      modelos.forEach(modelo => {
        const option = document.createElement('option');
        option.value = modelo;
        option.textContent = modelo;
        selectModelos.appendChild(option);
      });
    })
    .catch(error => {
      console.error('Erro ao obter a lista de modelos:', error);
    });

  });
  