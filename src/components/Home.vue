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
            <el-input v-model="myAddress" placeholder="地址"></el-input>
          </div>
          <div class="info">
            <span>私钥：</span>
            <el-input type="password" v-model="primaryKey" placeholder="私钥"></el-input>
          </div>
          <div class="info">
            <span>网关：</span>
            <el-input v-model="gateway" placeholder="网关"></el-input>
          </div>
          
          <div class="info">
            <el-row :gutter="8">
              <el-col :span="8">
                <el-tooltip class="item" effect="dark" content="买入价 = 当前价 * ( 1 - 买入比/100 )" placement="right">
                  <el-button>买入比(%)：</el-button>
                </el-tooltip>
                <el-input v-model="buyRate" placeholder="买入比(%),例如: 2"></el-input>
              </el-col>
              <el-col :span="8">
                <el-tooltip class="item" effect="dark" content="卖出价 = 当前价 * ( 1 + 卖出比/100 )" placement="right">
                  <el-button>卖出比(%)：</el-button>
                </el-tooltip>
                <el-input v-model="sellRate" placeholder="卖出比(%),例如: 2"></el-input>
              </el-col>
              <el-col :span="8">
                <el-tooltip class="item" effect="dark" content="单个订单的价值，无论买入卖出都按照CNY结算。例如买单时，订单价值 = 买入价 * 买入量" placement="right">
                  <el-button>订单价值(CNY)：</el-button>
                </el-tooltip>
                <el-input v-model="orderTotal" placeholder="订单价值(CNY),例如: 10"></el-input>
              </el-col>
              <el-col :span="8">
                <el-tooltip class="item" effect="dark" content="达到该上限值，则停止卖出XLM" placement="right">
                  <el-button>CNY上限：</el-button>
                </el-tooltip>
                <el-input v-model="limitCNY" placeholder="CNY上限"></el-input>
              </el-col>
              <el-col :span="8">
                <el-tooltip class="item" effect="dark" content="达到该上限值，则停止买入XLM，按照CNY计算" placement="right">
                  <el-button>XLM上限(CNY)：</el-button>
                </el-tooltip>
                <el-input v-model="limitXLM" placeholder="XLM上限"></el-input>
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
  </el-row>
</template>

<script>
const intervalTime = 5
const bookLimit = 30
let assetNative = new StellarSdk.Asset.native()
let assetCNY = null
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
      myAddress: null,
      primaryKey: null,
      gateway: null,
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
      orders: []
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
          console.log(msg)
          break
        default:
          this.$message(msg)
          console.log(msg)
          break
      }
    },
    fixNum (val, limit = 3) {
      return val.toFixed(limit)
    },
    orderbook (data) {
      let that = this
      this.server.orderbook(
        assetNative,
        assetCNY
      )
      .call()
      .then((resp) => {
        resp.asks.forEach((val, index) => {
          if (index === 0) {
            that.sellPrice = val.price
          }
          that.asks.push(val)
        })
        resp.bids.forEach((val, index) => {
          if (index === 0) {
            that.buyPrice = val.price
          }
          that.bids.push(val)
        })
        //console.log(resp)
      })
      .catch((err) => {
        console.error(err)
      })
    },
    myOffers () {
      let that = this
      this.server.offers('accounts', this.myAddress)
      .call()
      .then(function (offerResult) {
        that.orders = []
        offerResult.records.forEach((val, index) => {
          if (val.buying.asset_type !== 'native') {
            that.orders.push({
              seq: val.id,
              order_type: 'sell',
              amount: that.fixNum(parseFloat(val.amount) / parseFloat(val.price), 5),
              price: val.price
            })
          } else {
            that.orders.push({
              seq: val.id,
              order_type: 'buy',
              amount: that.fixNum(parseFloat(val.amount) * parseFloat(val.price), 5),
              price: that.fixNum(1 / parseFloat(val.price), 5)
            })
          }
        })
        //console.log(offerResult);
      })
      .catch(function (err) {
        console.error(err);
      })
    },
    updateBalance () {
      let that = this
      this.server.accounts()
        .accountId(this.myAddress)
        .call()
        .then( (account) => {
          let b = account.balances
          b.forEach((val, index) => {
            if (val.asset_type === 'credit_alphanum4' && val.asset_issuer === that.gateway) {
              that.myCNY = val.balance
            }
            if (val.asset_type === 'native') {
              that.myXLM = val.balance
            }
          })
        })
        .catch((err) => {
          console.error(err)
        })
      
    },
    intervalFunc () {
      this.updateBalance()
      this.orderbook()
      this.myOffers()
      //console.log(StellarSdk)
    },
    orderCreate (orderType, data) {
      
    },
    orderCancel (data) {
    },
    tableRowClassName (row, index) {
      if (row.account === this.myAddress) {
        return 'info-buy'
      }
    }
  },
  mounted () {
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
    assetCNY = new StellarSdk.Asset('CNY', this.gateway)
    this.server = new StellarSdk.Server(this.serverUrl)
    //this.currentAccount = new StellarSdk.Account(this.myAddress)
    let that = this
    this.intervalFunc()
    this.interval = setInterval( () => {
      that.intervalFunc()
    }, intervalTime * 1000)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
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
</style>
