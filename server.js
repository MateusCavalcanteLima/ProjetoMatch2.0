const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuração do Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Conexão com MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/lovefinder', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado ao MongoDB!'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Schema do Usuário
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota de registro
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log('Tentando registrar:', { name, email });

        // Verificar se usuário já existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        // Criar novo usuário
        const user = new User({ name, email, password });
        await user.save();
        
        console.log('Usuário registrado com sucesso:', user._id);
        res.status(201).json({ 
            message: 'Usuário registrado com sucesso!',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(400).json({ error: 'Erro ao registrar usuário.' });
    }
});

// Rota de login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Tentando login:', email);

        // Buscar usuário
        const user = await User.findOne({ 
            email: email.toLowerCase(),
            password: password
        });
        
        if (user) {
            console.log('Login bem-sucedido:', user._id);
            res.json({
                message: 'Login realizado com sucesso!',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });
        } else {
            console.log('Login falhou: usuário não encontrado');
            res.status(401).json({ error: 'Email ou senha inválidos.' });
        }
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(400).json({ error: 'Erro ao fazer login.' });
    }
});

// Rota para listar usuários (apenas para debug)
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao listar usuários' });
    }
});

// Rota de teste
app.get('/test', (req, res) => {
    res.json({ message: 'Servidor funcionando!' });
});

// Rota para atualizar perfil
app.post('/update-profile', upload.single('profileImage'), async (req, res) => {
    try {
        const { userId, name, currentPassword, newPassword } = req.body;
        console.log('Tentativa de atualização de perfil:', userId); // Log para debug

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        if (currentPassword && currentPassword !== user.password) {
            return res.status(401).json({ error: 'Senha atual incorreta' });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (newPassword) updateData.password = newPassword;
        if (req.file) updateData.profileImage = `/uploads/${req.file.filename}`;

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            updateData, 
            { new: true }
        );

        console.log('Perfil atualizado:', updatedUser); // Log para debug
        res.json({
            message: 'Perfil atualizado com sucesso',
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                profileImage: updatedUser.profileImage
            }
        });
    } catch (error) {
        console.error('Erro na atualização:', error); // Log para debug
        res.status(400).json({ error: 'Erro ao atualizar perfil' });
    }
});

// Criar pasta uploads se não existir
const fs = require('fs');
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
    console.error('Erro não tratado:', error);
});