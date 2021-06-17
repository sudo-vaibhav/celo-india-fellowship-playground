const { assert } = require("chai")

const Sticker = artifacts.require("Sticker")

require("chai")
    .use(require("chai-as-promised"))
    .should()


contract("Sticker", (accounts) => {
    let sticker
    
    before(async () => {
        sticker = await Sticker.deployed()
    })
    describe("deployment", () => {
        it("deploys successfully", async () => {
            const address = sticker.address
            console.log("address: ", address)
            assert.notEqual(address,"")
            assert.notEqual(address,null)
            assert.notEqual(address,undefined)
            assert.notEqual(address,0x0)
        })
    })

    describe("storage", () => {
        it("updates the sticker path", async () => {
            const imagePath = "abc123"
            await sticker.setSticker(imagePath)
            assert.equal(await sticker.imagePath(),imagePath)
        })
    })
})