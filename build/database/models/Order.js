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
exports.Orders = void 0;
/* eslint-disable import/no-cycle */
const typeorm_1 = require("typeorm");
const Addresses_1 = require("./Addresses");
const Tracking_1 = require("./Tracking");
const Users_1 = require("./Users");
let Orders = class Orders {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Orders.prototype, "id", void 0);
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], Orders.prototype, "image_url", void 0);
__decorate([
    typeorm_1.Column('boolean'),
    __metadata("design:type", Boolean)
], Orders.prototype, "picked_up", void 0);
__decorate([
    typeorm_1.Column('boolean'),
    __metadata("design:type", Boolean)
], Orders.prototype, "delivered", void 0);
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], Orders.prototype, "reference", void 0);
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], Orders.prototype, "payment_reference", void 0);
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], Orders.prototype, "status", void 0);
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], Orders.prototype, "tracking_ref", void 0);
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], Orders.prototype, "item_name", void 0);
__decorate([
    typeorm_1.Column({ type: 'decimal', precision: 20, scale: 4 }),
    __metadata("design:type", Number)
], Orders.prototype, "item_amount", void 0);
__decorate([
    typeorm_1.Column('text'),
    __metadata("design:type", String)
], Orders.prototype, "description", void 0);
__decorate([
    typeorm_1.Column({ type: 'decimal', precision: 20, scale: 2 }),
    __metadata("design:type", Number)
], Orders.prototype, "weight", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Users_1.Users, (user) => user.orders),
    __metadata("design:type", Users_1.Users)
], Orders.prototype, "user", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Addresses_1.Addresses, (address) => address.id),
    __metadata("design:type", Addresses_1.Addresses)
], Orders.prototype, "pickup", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Addresses_1.Addresses, (address) => address.id),
    __metadata("design:type", Addresses_1.Addresses)
], Orders.prototype, "delivery", void 0);
__decorate([
    typeorm_1.OneToMany(() => Tracking_1.Tracking, (track) => track.order),
    __metadata("design:type", Array)
], Orders.prototype, "tracking", void 0);
__decorate([
    typeorm_1.Column('boolean'),
    __metadata("design:type", Boolean)
], Orders.prototype, "cancelled", void 0);
__decorate([
    typeorm_1.Column('timestamp with time zone'),
    __metadata("design:type", Date)
], Orders.prototype, "cancelled_at", void 0);
__decorate([
    typeorm_1.Column('timestamp with time zone'),
    __metadata("design:type", Date)
], Orders.prototype, "created_at", void 0);
__decorate([
    typeorm_1.Column('timestamp with time zone'),
    __metadata("design:type", Date)
], Orders.prototype, "processed_at", void 0);
__decorate([
    typeorm_1.Column('timestamp with time zone'),
    __metadata("design:type", Date)
], Orders.prototype, "updated_at", void 0);
Orders = __decorate([
    typeorm_1.Entity()
], Orders);
exports.Orders = Orders;
//# sourceMappingURL=Order.js.map