"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
require("dotenv/config");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var sucursal1, sucursal2, catUrban, catSport, catRunning, prod1, prod2, _i, _a, v, _b, _c, v;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log('Seeding database...');
                    return [4 /*yield*/, prisma.sucursal.create({
                            data: {
                                nombre: 'Punto Zapas Centro',
                                direccion: 'Calle Independencia #123',
                                estado: 'ACTIVO'
                            }
                        })];
                case 1:
                    sucursal1 = _d.sent();
                    return [4 /*yield*/, prisma.sucursal.create({
                            data: {
                                nombre: 'Punto Zapas Norte',
                                direccion: 'Av. Banzer 4to Anillo',
                                estado: 'ACTIVO'
                            }
                        })];
                case 2:
                    sucursal2 = _d.sent();
                    return [4 /*yield*/, prisma.categoria.create({ data: { nombre: 'Urban' } })];
                case 3:
                    catUrban = _d.sent();
                    return [4 /*yield*/, prisma.categoria.create({ data: { nombre: 'Sport' } })];
                case 4:
                    catSport = _d.sent();
                    return [4 /*yield*/, prisma.categoria.create({ data: { nombre: 'Running' } })];
                case 5:
                    catRunning = _d.sent();
                    return [4 /*yield*/, prisma.producto.create({
                            data: {
                                categoria_id: catUrban.id_categoria,
                                modelo: 'Air Max 90',
                                marca: 'Nike',
                                costo_adquisicion: 300.0,
                                precio_venta: 500.0,
                                descripcion: 'Zapatillas clásicas urbanas',
                                imagenes: ['/placeholder.png'],
                                variantes: {
                                    create: [
                                        { talla: '40', color: 'Blanco', sku: 'NK-AM90-40-WH' },
                                        { talla: '41', color: 'Blanco', sku: 'NK-AM90-41-WH' },
                                        { talla: '42', color: 'Negro', sku: 'NK-AM90-42-BK' },
                                    ]
                                }
                            },
                            include: { variantes: true }
                        })];
                case 6:
                    prod1 = _d.sent();
                    return [4 /*yield*/, prisma.producto.create({
                            data: {
                                categoria_id: catRunning.id_categoria,
                                modelo: 'Ultraboost',
                                marca: 'Adidas',
                                costo_adquisicion: 400.0,
                                precio_venta: 650.0,
                                descripcion: 'Alta tecnología para correr',
                                imagenes: ['/placeholder.png'],
                                variantes: {
                                    create: [
                                        { talla: '39', color: 'Gris', sku: 'AD-UB-39-GR' },
                                        { talla: '40', color: 'Gris', sku: 'AD-UB-40-GR' },
                                    ]
                                }
                            },
                            include: { variantes: true }
                        })];
                case 7:
                    prod2 = _d.sent();
                    _i = 0, _a = prod1.variantes;
                    _d.label = 8;
                case 8:
                    if (!(_i < _a.length)) return [3 /*break*/, 11];
                    v = _a[_i];
                    return [4 /*yield*/, prisma.inventario.create({
                            data: {
                                sucursal_id: sucursal1.id_sucursal,
                                variante_id: v.id_variante_producto,
                                cantidad: 15,
                                nivel_minimo: 5
                            }
                        })];
                case 9:
                    _d.sent();
                    _d.label = 10;
                case 10:
                    _i++;
                    return [3 /*break*/, 8];
                case 11:
                    _b = 0, _c = prod2.variantes;
                    _d.label = 12;
                case 12:
                    if (!(_b < _c.length)) return [3 /*break*/, 15];
                    v = _c[_b];
                    return [4 /*yield*/, prisma.inventario.create({
                            data: {
                                sucursal_id: sucursal2.id_sucursal,
                                variante_id: v.id_variante_producto,
                                cantidad: 20,
                                nivel_minimo: 3
                            }
                        })];
                case 13:
                    _d.sent();
                    _d.label = 14;
                case 14:
                    _b++;
                    return [3 /*break*/, 12];
                case 15: 
                // 5. Cliente Mock
                return [4 /*yield*/, prisma.cliente.create({
                        data: {
                            nombre_completo: 'Juan Perez',
                            telefono: '77712345',
                            email: 'juan@example.com',
                            nit_facturacion: '1234567011'
                        }
                    })];
                case 16:
                    // 5. Cliente Mock
                    _d.sent();
                    console.log('Seeding completed!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
