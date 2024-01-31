
// JSON.stringify needs some help with BigInt-s
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
}
