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
exports.Tracking = void 0;
/* eslint-disable import/no-cycle */
const typeorm_1 = require("typeorm");
const Addresses_1 = require("./Addresses");
const Order_1 = require("./Order");
let Tracking = class Tracking {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Tracking.prototype, "id", void 0);
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], Tracking.prototype, "reference", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Order_1.Orders),
    __metadata("design:type", Order_1.Orders)
], Tracking.prototype, "order", void 0);
__decorate([
    typeorm_1.OneToMany(() => Addresses_1.Addresses, (address) => address.tracking),
    __metadata("design:type", Array)
], Tracking.prototype, "address", void 0);
__decorate([
    typeorm_1.Column('int'),
    __metadata("design:type", Number)
], Tracking.prototype, "location_address_id", void 0);
__decorate([
    typeorm_1.Column('timestamp with time zone'),
    __metadata("design:type", Date)
], Tracking.prototype, "created_at", void 0);
__decorate([
    typeorm_1.Column('timestamp with time zone'),
    __metadata("design:type", Date)
], Tracking.prototype, "updated_at", void 0);
Tracking = __decorate([
    typeorm_1.Entity()
], Tracking);
exports.Tracking = Tracking;
//# sourceMappingURL=Tracking.js.map