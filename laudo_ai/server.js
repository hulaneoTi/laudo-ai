const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename: function (req, file, cb) {
    cb(null, 'audio.wav');
  }
});

const upload = multer({ storage });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/scripts.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'public', 'scripts.js'));
});

app.post('/gravar-audio', upload.single('audio'), (req, res) => {
  if (req.file) {
    const filePath = req.file.path;
    res.sendFile(filePath);
  } else {
    res.status(500).send('Erro ao gravar o áudio');
  }
});

app.post('/enviar', (req, res) => {
  const modeloSelecionado = req.body.modelo;

  const comando = `bash chatgpt.sh "${modeloSelecionado}"`;

  exec(comando, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro ao executar o script: ${error}`);
      res.status(500).json({ error: 'Erro ao executar o script' });
      return;
    }

    if (stderr) {
      console.error(`Erro de script: ${stderr}`);
      res.status(500).json({ error: 'Erro de script' });
      return;
    }

    const resultado = stdout.trim();
    res.json({ output: resultado }); // Enviar o resultado como um objeto JSON
  });
});


app.get('/modelos', (req, res) => {
  const diretorioModelos = path.join(__dirname, 'modelos');

  fs.readdir(diretorioModelos, (err, files) => {
    if (err) {
      console.error('Erro ao ler o diretório de modelos:', err);
      res.status(500).json({ error: 'Erro ao ler o diretório de modelos' });
      return;
    }

    res.json({ modelos: files });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
