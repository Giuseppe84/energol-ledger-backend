"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// src/server.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const prisma_1 = __importDefault(require("./utils/prisma"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Importa tutte le tue rotte
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const role_routes_1 = __importDefault(require("./routes/role.routes"));
const permission_routes_1 = __importDefault(require("./routes/permission.routes")); // <-- Nuova
const client_routes_1 = __importDefault(require("./routes/client.routes"));
const property_routes_1 = __importDefault(require("./routes/property.routes"));
const subject_routes_1 = __importDefault(require("./routes/subject.routes"));
const serviceType_routes_1 = __importDefault(require("./routes/serviceType.routes"));
const service_routes_1 = __importDefault(require("./routes/service.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173', // O l'IP/hostname del frontend esatto
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
// Middlewares globali
app.use(express_1.default.json()); // Per parsare il body delle richieste JSON
app.use((0, helmet_1.default)()); // Per aggiungere header di sicurezza
app.use(express_1.default.urlencoded({ extended: true })); // Per parsare i dati URL-encoded
// Rotte API
app.get('/', (req, res) => {
    res.send('Welcome to the EnergoLedger API!');
});
// Rotte per autenticazione, ruoli e permessi (spesso non richiedono autenticazione per login/register)
app.use('/api/auth', auth_routes_1.default);
app.use('/api/roles', role_routes_1.default); // Queste rotte useranno i middleware al loro interno
app.use('/api/permissions', permission_routes_1.default); // Queste rotte useranno i middleware al loro interno
// Tutte le altre rotte che richiedono autenticazione e autorizzazione
app.use('/api/users', user_routes_1.default);
app.use('/api/clients', client_routes_1.default);
app.use('/api/properties', property_routes_1.default);
app.use('/api/subjects', subject_routes_1.default);
app.use('/api/service-types', serviceType_routes_1.default);
app.use('/api/services', service_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
// Gestione degli errori (catch-all)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
// Avvia il server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    prisma_1.default.$connect()
        .then(() => console.log('Database connected successfully!'))
        .catch((e) => console.error('Database connection failed:', e));
});
