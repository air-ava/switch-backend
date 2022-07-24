"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Addresses = void 0;
/* eslint-disable import/no-cycle */
const typeorm_1 = require("typeorm");
const Tracking_1 = require("./Tracking");
const Users_1 = require("./Users");
let Addresses = class Addresses {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Addresses.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Users_1.Users),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Users_1.Users)
], Addresses.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Tracking_1.Tracking),
    __metadata("design:type", Tracking_1.Tracking)
], Addresses.prototype, "tracking", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Addresses.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Addresses.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Addresses.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Addresses.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Addresses.prototype, "business_mobile", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Addresses.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean'),
    __metadata("design:type", Boolean)
], Addresses.prototype, "default", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean'),
    __metadata("design:type", Boolean)
], Addresses.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp with time zone'),
    __metadata("design:type", Date)
], Addresses.prototype, "deleted_at", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp with time zone'),
    __metadata("design:type", Date)
], Addresses.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp with time zone'),
    __metadata("design:type", Date)
], Addresses.prototype, "updated_at", void 0);
Addresses = __decorate([
    (0, typeorm_1.Entity)()
], Addresses);
exports.Addresses = Addresses;
//# sourceMappingURL=Addresses.js.map