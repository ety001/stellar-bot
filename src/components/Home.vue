<template>
  <el-row>
    <el-col :span="20" :offset="2">
      <!-- status -->
      <el-row>
        <el-col :span="6">
          <span>机器人状态：</span>
          <el-switch
            v-model="robotStatus"
            on-color="#13ce66"
            off-color="#ff4949">
          </el-switch>
        </el-col>
      </el-row>
      <!-- content -->
      <el-row :gutter="12">
        <el-col :span="8">
          <div class="info">
            <span>Buy Price：</span>
            <el-tag type="success">{{ buyPrice }}</el-tag>
            <span>Sell Price：</span>
            <el-tag type="success">{{ sellPrice }}</el-tag>
          </div>
          <div class="info">
            <el-row>
              <el-col :span="12">
                <el-tooltip class="item" effect="dark" content="当前可用CNY" placement="right">
                  <el-button>当前拥有CNY：{{ myCNY }}</el-button>
                </el-tooltip>
              </el-col>
              <el-col :span="12">
                <el-tooltip class="item" effect="dark" content="当前可用XLM" placement="right">
                  <el-button>当前拥有XLM：{{ myXLM }}</el-button>
                </el-tooltip>
              </el-col>
            </el-row>
          </div>
          <div class="info">
            <el-row>
              <el-col :span="12">
                <el-tooltip class="item" effect="dark" content="当前可用CNY + 当前可用XLM * buyPrice" placement="right">
                  <el-button>CNY资产：{{ totalCNY }}</el-button>
                </el-tooltip>
              </el-col>
              <el-col :span="12">
                <el-tooltip class="item" effect="dark" content="当前可用CNY / sellPrice + 当前可用XLM" placement="right">
                  <el-button>XLM资产：{{ totalXLM }}</el-button>
                </el-tooltip>
              </el-col>
            </el-row>
          </div>
          <div class="info">
            <span>地址：</span>
            <el-input v-model.trim="myAddress" placeholder="地址"></el-input>
          </div>
          <div class="info">
            <span>私钥：</span>
            <el-input type="password" v-model.trim="primaryKey" placeholder="私钥"></el-input>
          </div>
          <div class="info">
            <span>网关：</span>
            <el-input v-model.trim="gateway" placeholder="网关"></el-input>
          </div>
          
          <div class="info">
            <el-row :gutter="8">
              <el-col :span="8">
                <el-tooltip class="item" effect="dark" content="买入价 = 当前价 * ( 1 - 买入比/100 )" placement="right">
                  <el-button>买入比(%)：</el-button>
                </el-tooltip>
                <el-input v-model.trim="buyRate" placeholder="买入比(%),例如: 2"></el-input>
              </el-col>
              <el-col :span="8">
                <el-tooltip class="item" effect="dark" content="卖出价 = 当前价 * ( 1 + 卖出比/100 )" placement="right">
                  <el-button>卖出比(%)：</el-button>
                </el-tooltip>
                <el-input v-model.trim="sellRate" placeholder="卖出比(%),例如: 2"></el-input>
              </el-col>
              <el-col :span="8">
                <el-tooltip class="item" effect="dark" content="单个订单的价值，无论买入卖出都按照CNY结算。例如买单时，订单价值 = 买入价 * 买入量" placement="right">
                  <el-button>订单价值(CNY)：</el-button>
                </el-tooltip>
                <el-input v-model.trim="orderTotal" placeholder="订单价值(CNY),例如: 10"></el-input>
              </el-col>
              <el-col :span="8">
                <el-tooltip class="item" effect="dark" content="达到该上限值，则停止卖出XLM" placement="right">
                  <el-button>CNY上限：</el-button>
                </el-tooltip>
                <el-input v-model.trim="limitCNY" placeholder="CNY上限"></el-input>
              </el-col>
              <el-col :span="8">
                <el-tooltip class="item" effect="dark" content="达到该上限值，则停止买入XLM，按照CNY计算" placement="right">
                  <el-button>XLM上限(CNY)：</el-button>
                </el-tooltip>
                <el-input v-model.trim="limitXLM" placeholder="XLM上限"></el-input>
              </el-col>
              <el-col :span="8">
                <br><br>
                <el-button type="primary" @click="save">保存配置</el-button>
              </el-col>
            </el-row>
          </div>
        </el-col>
        <el-col :span="16">
          <h4>Offsers List</h4>
          <el-row :gutter="8">
            <el-col :span="12">
              <el-table
                :data="bids"
                height="250"
                border
                style="width: 100%"
                :row-class-name="tableRowClassName">
                <el-table-column label="买单" align="right">
                  <el-table-column
                    prop="amount"
                    label="数量(XLM)"
                    align="right">
                  </el-table-column>
                  <el-table-column
                    prop="price"
                    label="价格(CNY)"
                    align="right">
                  </el-table-column>
                </el-table-column>
              </el-table>
            </el-col>
            <el-col :span="12">
              <el-table
                :data="asks"
                height="250"
                border
                style="width: 100%"
                :row-class-name="tableRowClassName">
                <el-table-column label="卖单" align="left">
                  <el-table-column
                    prop="price"
                    label="价格(CNY)">
                  </el-table-column>
                  <el-table-column
                    prop="amount"
                    label="数量(XLM)">
                  </el-table-column>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>
          <h4>Orders</h4>
          <el-row :gutter="8">
            <el-col :span="12">
              <el-table
                :data="orders"
                border
                style="width: 100%">
                <el-table-column
                  prop="seq"
                  label="Seq">
                </el-table-column>
                <el-table-column
                  prop="order_type"
                  label="Type">
                </el-table-column>
                <el-table-column
                  prop="amount"
                  label="数量(XLM)">
                </el-table-column>
                <el-table-column
                  prop="price"
                  label="价格">
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-col>
    <el-col id="donor" :span="20" :offset="2">
      捐助作者XLM： <b>{{ donor }}</b>
    </el-col>
  </el-row>
</template>

<script>
const version = 'v0.0.4'
const intervalTime = 10
const bookLimit = 30
let assetNative = new StellarSdk.Asset.native()
export default {
  name: 'home',
  data () {
    return {
      interval: null,
      serverTestUrl: 'https://horizon-testnet.stellar.org',
      serverUrl: 'https://horizon.stellar.org',
      server: null,
      robotStatus: false,
      buyPrice: 0,
      sellPrice: 0,
      myXLM: 0,
      myCNY: 0,
      currentAccount: null,
      myAddress: '',
      primaryKey: '',
      sourceKeypair: null,
      gateway: '',
      buyRate: null,
      sellRate: null,
      orderTotal: null, // 订单量
      limitCNY: null,
      limitXLM: null,
      asks: [],
      bids: [],
      transactions: [],
      sequence: 0,
      ledgerSequence: 0,
      orders: [],
      buyOrderNum: 0,
      sellOrderNum: 0,
      donor: 'GCRF5BWQLVAEDIE4J25KJ5XKC3JI5XKPCT2BA7PZD7B2SW3LSPVX5ENC'
    }
  },
  computed: {
    totalXLM () {
      return this.fixNum(parseFloat(this.myXLM) + parseFloat(this.myCNY) / parseFloat(this.sellPrice), 5)
    },
    totalCNY () {
      return this.fixNum(parseFloat(this.myCNY) + parseFloat(this.myXLM) * parseFloat(this.buyPrice), 5)
    }
  },
  methods: {
    save (e) {
      let mem = {
        myAddress: this.myAddress,
        primaryKey: this.primaryKey,
        gateway: this.gateway,
        buyRate: this.buyRate,
        sellRate: this.sellRate,
        orderTotal: this.orderTotal,
        limitCNY: this.limitCNY,
        limitXLM: this.limitXLM
      }
      localStorage.mem = JSON.stringify(mem)
      this.msgOpen('保存成功', 'success')
    },
    msgOpen (msg, msgType = 'success') {
      switch (msgType) {
        case 'error':
          this.$message.error(msg)
          console.error(msg)
          break
        case 'success':
        case 'warning':
          this.$message({
            message: msg,
            type: msgType
          })
          this.console([msg, 'msgOpen, warning'])
          break
        default:
          this.$message(msg)
          this.console([msg, 'msgOpen, default'])
          break
      }
    },
    fixNum (val, limit = 3) {
      val = parseFloat(val)
      return val.toFixed(limit)
    },
    orderbook (data) {
      let assetCNY = new StellarSdk.Asset('CNY', this.gateway)
      this.server.orderbook(
        assetNative,
        assetCNY
      )
      .call()
      .then((resp) => {
        this.console([resp, 'orderbook, resp'])
        this.asks = []
        this.bids = []
        resp.asks.forEach((val, index) => {
          if (index === 0) {
            this.sellPrice = val.price
          }
          this.asks.push(val)
        })
        resp.bids.forEach((val, index) => {
          if (index === 0) {
            this.buyPrice = val.price
          }
          val.amount = this.fixNum(val.amount / val.price, 7)
          this.bids.push(val)
        })
      })
      .catch((err) => {
        console.error(err, 'orderbook')
      })
    },
    myOffers (callback=null) {
      this.buyOrderNum = 0
      this.sellOrderNum = 0
      this.server.offers('accounts', this.myAddress)
      .call()
      .then((offerResult) => {
        this.orders = []
        this.console([offerResult, 'myOffers, offerResult'])
        let offerResultLength = offerResult.records.length
        this.console([offerResultLength, 'myOffers, offerResultLength'])
        if (offerResultLength > 0) {
          return Promise.all(offerResult.records.map((row) => {
            if (row.buying.asset_type !== 'native') {
              this.orders.push({
                seq: row.id,
                order_type: 'sell',
                amount: this.fixNum(row.amount, 7),
                price: this.fixNum(row.price, 7),
                selling: row.selling,
                buying: row.buying
              })
              this.sellOrderNum ++
            } else {
              this.orders.push({
                seq: row.id,
                order_type: 'buy',
                amount: this.fixNum(parseFloat(row.amount) * parseFloat(row.price), 7),
                price: this.fixNum(1 / parseFloat(row.price), 7),
                selling: row.selling,
                buying: row.buying
              })
              this.buyOrderNum ++
            }
            return true
          }))
        } else {
          if (this.robotStatus === true) {
            this.console('robotStatus is true')
            this.buyOrder(true) // 同时下买卖单
          }
          return [false] // 不执行 robot()
        }
      })
      .then((res) => {
        this.console([res, 'myOffers, callback'])
        if (res[0] === true) {
          callback()
        }
      })
      .catch((err) => {
        console.error(err, 'myOffers')
      })
    },
    updateBalance () {
      this.server.accounts()
        .accountId(this.myAddress)
        .call()
        .then( (account) => {
          let b = account.balances
          b.forEach((val, index) => {
            if (val.asset_type === 'credit_alphanum4' && val.asset_issuer === this.gateway) {
              this.myCNY = val.balance
            }
            if (val.asset_type === 'native') {
              this.myXLM = val.balance
            }
          })
        })
        .catch((err) => {
          console.error(err, 'update balance')
        })
    },
    intervalFunc () {
      console.log('run')
      if (this.myAddress != '') {
        this.updateBalance()
        if (this.gateway != '') {
          this.orderbook()
          this.myOffers(() => {this.robot()})
        } else {
          this.console('请输入网关地址', 'msg')
        }
      } else {
        this.console('请输入钱包地址', 'msg')
      }
    },
    robot () {
      if (this.primaryKey == '') {
        return this.console('请输入密钥', 'msg')
      }
      // console.log(this.robotStatus)
      if (this.robotStatus === true) {
        // 计算买入卖出价格
        let buyPrice = this.fixNum(this.buyPrice * (1 - this.buyRate / 100), 5)
        let sellPrice = this.fixNum(this.sellPrice * (1 + this.sellRate / 100), 5)
        // 初始化数据
        let offersLength = this.orders.length
        let maxBuyOrderSeq = 0
        let maxSellOrderSeq = 0
        let tmpBuyOrders = []
        let tmpSellOrders = []
        this.console([this.buyOrderNum, this.sellOrderNum, this.buyOrderNum === 0 && this.sellOrderNum === 0, 'robot 1'])
        if (this.buyOrderNum === 0 && this.sellOrderNum === 0) {
          this.buyOrder(true)
        } else {
          // 开始处理(先取消订单，再下订单)
          this.orders.forEach((val, index) => {
            if (val.order_type === 'buy') {
              // 取消超出范围的订单
              if (this.fixNum(val.price, 4) < this.fixNum(buyPrice, 4)) {
                this.orderCancel(val, `Reason: price change(${this.fixNum(val.price, 2)}, ${this.fixNum(buyPrice, 2)})`)
              } else {
                // 获取最晚的一个seq
                if (val.seq > maxBuyOrderSeq) {
                  maxBuyOrderSeq = val.seq
                }
                // 未处理订单放到临时数组
                tmpBuyOrders.push(val)
              }
            } else {
              // 取消超出范围的订单
              if (this.fixNum(val.price, 4) > this.fixNum(sellPrice, 4)) {
                this.orderCancel(val, `Reason: price change(${this.fixNum(val.price, 2)}, ${this.fixNum(sellPrice, 2)})`)
              } else {
                // 获取最晚的一个seq
                if (val.seq > maxSellOrderSeq) {
                  maxSellOrderSeq = val.seq
                }
                // 未处理订单放到临时数组
                tmpSellOrders.push(val)
              }
            }
            // 如果已经是最后一次循环
            if (index === offersLength - 1) {
              if (tmpBuyOrders.length !== 1 || tmpSellOrders.length !== 1) {
                this.console(['Get in last foreach:', tmpBuyOrders, tmpSellOrders, maxBuyOrderSeq, maxSellOrderSeq])
              }
              if (tmpBuyOrders.length > 1) {
                // 处理多于一个的订单
                tmpBuyOrders.forEach((subVal, subIndex) => {
                  if (parseInt(subVal.seq) !== parseInt(maxBuyOrderSeq)) {
                    this.orderCancel(subVal, 'Reason: order num > 1')
                  }
                })
              } else if (tmpBuyOrders.length === 0) {
                // 下买单
                this.buyOrder()
              }
              if (tmpSellOrders.length > 1) {
                // 处理多于一个的订单
                tmpSellOrders.forEach((subVal, subIndex) => {
                  if (subVal.seq !== maxSellOrderSeq) {
                    this.orderCancel(subVal, 'Reason: order num > 1')
                  }
                })
              } else if (tmpSellOrders.length === 0) {
                // 下卖单
                this.sellOrder()
              }
            }
          })
        }
      }
    },
    buyOrder (tag=false) {
      let buyOrderPrice = this.fixNum(1 / (this.buyPrice * (1 - this.buyRate / 100)), 7)
      let buyOrderAmount = this.fixNum(this.orderTotal, 7)
      let assetCNY = new StellarSdk.Asset('CNY', this.gateway)
      this.console([buyOrderAmount, this.myCNY, tag, 'buyOrder 1'])
      // 买入量大于拥有量则退出
      this.console([parseFloat(buyOrderAmount) > parseFloat(this.myCNY), 'buyOrder 2'])
      if (parseFloat(buyOrderAmount) > parseFloat(this.myCNY)) {
        // 下买单的时候还没有卖单
        this.console([tag, 'buyOrder 3'])
        if (tag === true) {
          return this.sellOrder()
        }
        return
      }
      this.console([parseFloat(this.myXLM), parseFloat(this.limitXLM / this.sellPrice), 'buyOrder 4'])
      // 当持有的XLM多于XLM上限，则停止买入
      if (parseFloat(this.myXLM) >= parseFloat(this.limitXLM / this.sellPrice)) {
        // 下买单的时候还没有卖单
        this.console('buyOrder 5')
        if (tag === true) {
          return this.sellOrder()
        }
        return
      }
      this.console('buyOrder 6')
      this.server.loadAccount(this.myAddress)
        .then((account) => {
          var op = StellarSdk.Operation.manageOffer({
            selling: assetCNY,
            buying: assetNative,
            amount: buyOrderAmount, // The total amount you're selling
            price : buyOrderPrice // The exchange rate ratio (selling / buying)
          })
          let tx = new StellarSdk.TransactionBuilder(account).addOperation(op).build();
          this.console([op, tx, 'buyOrder 7'])
          tx.sign(StellarSdk.Keypair.fromSecret(this.primaryKey))
          return this.server.submitTransaction(tx)
        }).then((txResult) => {
          if (tag === true) {
            this.sellOrder()
          }
          this.orders.push({
            seq: txResult.id,
            order_type: 'buy',
            amount: this.fixNum(1 / buyOrderAmount, 7),
            price: this.fixNum(this.buyPrice * (1 - this.buyRate / 100), 7),
            selling: assetCNY,
            buying: assetNative
          })
          this.console([`Buy Order, buy: ${buyOrderAmount} XLM, price: ${buyOrderPrice}`, txResult], 'msg')
        }).catch((err) => {
          console.error('Offer Fail !', err, 'buyOrder')
        })
    },
    sellOrder () {
      let sellOrderPrice = this.fixNum(this.sellPrice * (1 + this.sellRate / 100), 7)
      let sellOrderAmount = this.fixNum(this.orderTotal / sellOrderPrice, 7)
      let assetCNY = new StellarSdk.Asset('CNY', this.gateway)

      this.console([parseFloat(this.myCNY) , parseFloat(this.limitCNY), 'sellOrder 1'])
      if (parseFloat(this.myCNY) >= parseFloat(this.limitCNY)) {
        // 当前持有cny多于cny上限停止下卖单
        return
      }
      this.console([sellOrderAmount, this.myXLM, 'sellOrder 2'])
      if (parseFloat(sellOrderAmount) > parseFloat(this.myXLM)) {
        return
      }
      this.console('sellOrder 3')
      this.server.loadAccount(this.myAddress)
        .then((account) => {
          var op = StellarSdk.Operation.manageOffer({
            selling: assetNative,
            buying: assetCNY,
            amount: sellOrderAmount, // The total amount you're selling
            price : sellOrderPrice // The exchange rate ratio (selling / buying)
          })
          let tx = new StellarSdk.TransactionBuilder(account).addOperation(op).build();
          tx.sign(StellarSdk.Keypair.fromSecret(this.primaryKey))
          return this.server.submitTransaction(tx)
        }).then((txResult) => {
          this.orders.push({
            seq: txResult.id,
            order_type: 'sell',
            amount: sellOrderAmount,
            price: sellOrderPrice,
            selling: assetNative,
            buying: assetCNY
          })
          this.console([`Sell Order, sell: ${sellOrderAmount} XLM, price: ${sellOrderPrice}`, txResult], 'msg')
        }).catch(function(err){
          console.error('Offer Fail !', err, 'sellOrder 4')
        })
    },
    orderCancel (offer, reason = '') {
      // console.log(offer)
      let assetCNY = new StellarSdk.Asset('CNY', this.gateway)
      this.server.loadAccount(this.myAddress)
        .then((account) => {
          var op = StellarSdk.Operation.manageOffer({
            selling: offer.order_type === 'buy' ? assetCNY : assetNative,
            buying: offer.order_type === 'buy' ? assetNative : assetCNY,
            amount: '0',
            price : offer.price,
            offerId: offer.seq
          })
          let tx = new StellarSdk.TransactionBuilder(account).addOperation(op).build();
          tx.sign(StellarSdk.Keypair.fromSecret(this.primaryKey))
          return this.server.submitTransaction(tx)
        }).then((txResult) => {
          this.console([`Cancel Order, ${reason}, order_id: ${offer.seq}`, txResult], 'msg')
        }).catch((err) => {
          console.error('Offer Fail !', err, 'orderCancel 1')
        })
    },
    tableRowClassName (row, index) {
      if (row.account === this.myAddress) {
        return 'info-buy'
      }
    },
    console (txt, dataType='debug') {
      if (dataType === 'msg' || (debugStellarBot === true && dataType === 'debug')) {
        console.log(txt)
      }
    }
  },
  mounted () {
    console.log(version)
    // load config if exist
    if (localStorage.mem !== undefined) {
      let localMem = JSON.parse(localStorage.mem)
      this.myAddress = localMem.myAddress
      this.primaryKey = localMem.primaryKey
      this.gateway = localMem.gateway
      this.buyRate = localMem.buyRate
      this.sellRate = localMem.sellRate
      this.orderTotal = localMem.orderTotal
      this.limitCNY = localMem.limitCNY
      this.limitXLM = localMem.limitXLM
    }
    this.server = new StellarSdk.Server(this.serverUrl)
    StellarSdk.Network.usePublicNetwork()
    this.intervalFunc()
    this.interval = setInterval(() => {
      this.intervalFunc()
    }, intervalTime * 1000)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .el-row {
    margin-top: 10px;
  }
  .info {
    margin-top: 10px;
  }
  .transactions {
    height: 400px;
    overflow-y: scroll;
    overflow-x: hidden;
  }
  .el-table .info-buy {
    background-color: #e2f0e4;
  }
  .el-table .info-sell {
    background-color: #f2dede;
  }
  #donor {
    background-color: #eef1f6;
    text-align: center;
    padding: 10px 0;
    margin-top: 10px;
  }
</style>
