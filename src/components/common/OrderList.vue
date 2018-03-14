<template>
  <md-card style="width: 100%;">
    <md-card-header>
      <md-card-header-text>
        <div class="md-title">{{ 'order_list.title' | translate }}</div>
      </md-card-header-text>
    </md-card-header>

    <md-card-content>
      <md-layout md-gutter class="main-box">
        <md-layout md-flex="100">
          <md-input-container>
            <label for="exchange_pair">{{ $t('robot') + ' ' + $t('exchange.exchange_pair') }}</label>
            <md-select name="exchange_pair" md-menu-class="custom-option" id="exchange_pair" v-model="selectedPair">
              <md-option v-for="pair in exchangePairs" :key="pair.skey" :value="pair.skey">{{ pair.text }}</md-option>
            </md-select>
          </md-input-container>
        </md-layout>
        <md-layout md-flex="60">
          <md-table style="width: 48%;">
            <md-table-header>
              <md-table-row>
                <md-table-head>{{ $t('order_list.buy_list') }}</md-table-head>
                <md-table-head></md-table-head>
                <md-table-head></md-table-head>
              </md-table-row>
            </md-table-header>
            <md-table-header>
              <md-table-row>
                <md-table-head>{{ $t('order_list.sell', {asset: `${selectedPairCounterAsset}`}) }}</md-table-head>
                <md-table-head>{{ $t('order_list.buy', {asset: `${selectedPairBaseAsset}`}) }}</md-table-head>
                <md-table-head>{{ $t('order_list.price', {pair: `${selectedPairStr}`}) }}</md-table-head>
              </md-table-row>
            </md-table-header>
            <md-table-body v-if="orderbook">
              <md-table-row v-for="(order, order_index) in orderbook.bids" :key="order_index">
                <md-table-cell>
                  <span>
                    {{ order.amount | fixNumCustom(7) }}
                  </span>
                </md-table-cell>
                <md-table-cell>
                  <span>
                    {{ (order.amount / order.price) | fixNumCustom(7) }}
                  </span>
                </md-table-cell>
                <md-table-cell>
                  <span>
                    {{ order.price | fixNumCustom(7) }}
                  </span>
                </md-table-cell>
              </md-table-row>
            </md-table-body>
            <md-table-body v-else>
              <md-table-row>
                <md-table-cell>
                  <span>No Data</span>
                </md-table-cell>
                <md-table-cell></md-table-cell>
                <md-table-cell></md-table-cell>
              </md-table-row>
            </md-table-body>
          </md-table>
          <md-table style="width: 48%;">
            <md-table-header>
              <md-table-row>
                <md-table-head>{{ $t('order_list.sell_list') }}</md-table-head>
                <md-table-head></md-table-head>
                <md-table-head></md-table-head>
              </md-table-row>
            </md-table-header>
            <md-table-header>
              <md-table-row>
                <md-table-head>{{ $t('order_list.price', {pair: `${selectedPairStr}`}) }}</md-table-head>
                <md-table-head>{{ $t('order_list.sell', {asset: `${selectedPairBaseAsset}`}) }}</md-table-head>
                <md-table-head>{{ $t('order_list.buy', {asset: `${selectedPairCounterAsset}`}) }}</md-table-head>
              </md-table-row>
            </md-table-header>
            <md-table-body v-if="orderbook">
              <md-table-row v-for="(order, order_index) in orderbook.asks" :key="order_index">
                <md-table-cell>
                  <span>
                    {{ order.price | fixNumCustom(7) }}
                  </span>
                </md-table-cell>
                <md-table-cell>
                  <span>
                    {{ order.amount | fixNumCustom(7) }}
                  </span>
                </md-table-cell>
                <md-table-cell>
                  <span>
                    {{ order.amount * order.price | fixNumCustom(7) }}
                  </span>
                </md-table-cell>
              </md-table-row>
            </md-table-body>
            <md-table-body v-else>
              <md-table-row>
                <md-table-cell>
                  <span>No Data</span>
                </md-table-cell>
                <md-table-cell></md-table-cell>
                <md-table-cell></md-table-cell>
              </md-table-row>
            </md-table-body>
          </md-table>
        </md-layout>
        <md-layout md-flex="40">
          <md-table style="width: 96%;">
            <md-table-header>
              <md-table-row>
                <md-table-head>{{ $t('order_list.my_list') }}</md-table-head>
                <md-table-head></md-table-head>
                <md-table-head></md-table-head>
              </md-table-row>
            </md-table-header>
            <md-table-header>
              <md-table-row>
                <md-table-head>{{ $t('myorder.type') }}</md-table-head>
                <md-table-head>{{ $t('myorder.price', {pair: ` (${selectedPairBaseAsset}/${selectedPairCounterAsset})`}) }}</md-table-head>
                <md-table-head>{{ $t('myorder.amount', {asset: ` (${selectedPairBaseAsset})`}) }}</md-table-head>
                <md-table-head></md-table-head>
              </md-table-row>
            </md-table-header>
            <md-table-body v-if="myOrderList">
              <md-table-row v-for="order in myOrderList" :key="order.id">
                <md-table-cell>
                  <span v-if="order.type === 'buy'" style="color: green;">
                    {{ $t('myorder.buy') }}
                  </span>
                  <span v-if="order.type === 'sell'" style="color: red;">
                    {{ $t('myorder.sell') }}
                  </span>
                </md-table-cell>
                <md-table-cell>
                  <span>{{ order.price | fixNumCustom(7) }}</span>
                </md-table-cell>
                <md-table-cell>
                  <span>{{ order.amount | fixNumCustom(7) }}</span>
                </md-table-cell>
                <md-table-cell></md-table-cell>
              </md-table-row>
            </md-table-body>
            <md-table-body v-else>
              <md-table-row>
                <md-table-cell>
                  <span>No Data</span>
                </md-table-cell>
                <md-table-cell></md-table-cell>
                <md-table-cell></md-table-cell>
                <md-table-cell></md-table-cell>
              </md-table-row>
            </md-table-body>
          </md-table>
        </md-layout>
      </md-layout>
    </md-card-content>
  </md-card>
</template>

<script>
import Api from '@/lib/Api';

export default {
  data() {
    return {
      selectedPair: '',
      selectedPairStr: '',
      selectedPairBaseAsset: '',
      selectedPairCounterAsset: '',
      orderbookInterval: null,
      orderbook: null,
      myOrderList: [],
    };
  },
  computed: {
    exchangePairs() {
      return this.$store.getters.exchangePairsSelector;
    },
  },
  watch: {
    selectedPair(newPair) {
      const pair = this.parseExchangeKey(newPair);
      this.selectedPairStr = `${pair.baseAsset}/${pair.counterAsset}`;
      this.selectedPairBaseAsset = pair.baseAsset;
      this.selectedPairCounterAsset = pair.counterAsset;
      window.Sconsole(['selectedPair', pair]);
      clearInterval(this.orderbookInterval);
      this.updateOrderBook(pair);
      this.orderbookInterval = setInterval(() => {
        this.updateOrderBook(pair);
        this.updateMyOrderList(pair);
      }, 5000);
    },
  },
  components: {
  },
  filters: {
    fixNumCustom: (val, fixed = 7) => window.fixNumCustom(val, fixed),
  },
  methods: {
    parseExchangeKey(key) {
      const tmp = key.split('_');
      const pair = {
        baseAsset: '',
        baseIssuer: '',
        counterAsset: '',
        counterIssuer: '',
      };
      tmp.forEach((item) => {
        const tmp2 = item.split('|');
        if (pair.baseAsset === '') {
          pair.baseAsset = tmp2[0];
          pair.baseIssuer = tmp2[1];
        } else {
          pair.counterAsset = tmp2[0];
          pair.counterIssuer = tmp2[1];
        }
      });
      return pair;
    },
    updateOrderBook(pair) {
      let sellingAsset = {};
      let buyingAsset = {};
      if (pair.baseAsset === 'XLM') {
        sellingAsset = { asset_code: 'XLM' };
      } else {
        sellingAsset = { asset_code: pair.baseAsset, asset_issuer: pair.baseIssuer };
      }
      if (pair.counterAsset === 'XLM') {
        buyingAsset = { asset_code: 'XLM' };
      } else {
        buyingAsset = { asset_code: pair.counterAsset, asset_issuer: pair.counterIssuer };
      }
      Api.getOrderBook(window.server, sellingAsset, buyingAsset, (res) => {
        this.orderbook = res;
      }, (errRes) => {
        window.Sconsole(['updateOrderbook fail', errRes], 'msg');
      });
    },
    updateMyOrderList(pair) {
      let sellingAsset = {};
      let buyingAsset = {};
      if (pair.baseAsset === 'XLM') {
        sellingAsset = { asset_type: 'native' };
      } else {
        sellingAsset = { asset_type: 'credit_alphanum4', asset_code: pair.baseAsset, asset_issuer: pair.baseIssuer };
      }
      if (pair.counterAsset === 'XLM') {
        buyingAsset = { asset_type: 'native' };
      } else {
        buyingAsset = { asset_type: 'credit_alphanum4', asset_code: pair.counterAsset, asset_issuer: pair.counterIssuer };
      }
      Api.getOffers(window.server, this.$store.getters.privateKey, (res) => {
        if (res.records.length > 0) {
          const tmpMyOrder = [];
          res.records.forEach((record) => {
            if (JSON.stringify(record.buying) === JSON.stringify(sellingAsset)
              && JSON.stringify(record.selling) === JSON.stringify(buyingAsset)) {
              tmpMyOrder.push({
                id: record.id,
                type: 'buy',
                price: 1 / record.price, // record.price = baseAsset / counterAsset
                amount: record.price * record.amount, // record.amount = counterAsset
              });
            }
            if (JSON.stringify(record.selling) === JSON.stringify(sellingAsset)
              && JSON.stringify(record.buying) === JSON.stringify(buyingAsset)) {
              tmpMyOrder.push({
                id: record.id,
                type: 'sell',
                price: record.price, // counterAsset / baseAsset
                amount: record.amount, // baseAsset
              });
            }
          });
          this.myOrderList = tmpMyOrder;
        }
      }, (errRes) => {
        window.Sconsole(['updateMyList fail', errRes], 'msg');
      });
    },
  },
};
</script>
<style scoped>
</style>
