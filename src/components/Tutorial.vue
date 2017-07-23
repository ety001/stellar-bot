<template>
  <el-row>
    <el-col :span="20" :offset="2">
      <div>
        <h1>
            <strong>教程</strong><br/>
        </h1>
        <p>
            机器人的目的就是为了增加市场的流动性。当前的算法就是以比当前价低x%的价格下买单，高y%的价格下卖单。
        </p>
        <p>
            <br/>
        </p>
        <ol class=" list-paddingleft-2" style="list-style-type: decimal;">
            <li>
                <p>
                    第一次访问，需要增加你的钱包信息，具体如下图，
                </p>
                <p>
                    <img src="/static/1.png" title="" alt="" width="500" height=""/>
                </p>
                <p>
                    在『1』的位置是你的钱包地址，在『2』的位置是私钥，网关地址请使用RippleFox的网关，『GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX』。
                </p>
            </li>
            <li>
                <p>
                    交易参数的设置可以参考下图
                </p>
                <p>
                    <img src="/static/2.png" width="500" height="" title="" alt=""/>
                </p>
                <p>
                    （1）图中『买入比』为2%，就是机器人自动下买单的价格是根据当前的『Buy Price』0.14925，降低2%下单，也就是 <em><b>0.14925 * (1 - 2%) = 0.146265</b></em>；
                </p>
                <p>
                    （2）图中『卖出比』为2%，同上的道理，就是卖单价格为 <em><b>0.152 * (1 + 2%) = 0.15504</b></em>；
                </p>
                <p>
                    （3）图中订单价值（CNY）为1，说明下单的时候，最后订单的价值为1CNY。比如图中的情况下买单，最后就是以 0.146265 的价格买入 6.8369 个 XLM，价值大约 1CNY，卖单的道理同买单；
                </p>
                <p>
                    （4）图中CNY上限为100，代表当前还可以下卖单，因为当前拥有的CNY是 0.8017302 ，不足100，同理，XLM上限为100CNY，那么以现在的卖出的价格 0.152 来计算，上限是 <em><b>100 / 0.152 = 657.894737 XLM</b></em>，而当前拥有 8083.4478679 个XLM，所以不再下买单。
                </p>
            </li>
            <li>
                <p>
                    设置完后，点击保存配置，然后手动刷新页面，就能看到已经可以读取到网关的交易数据了。点击『机器人状态』旁边的按钮，就可以启动机器人开始交易了。
                </p>
            </li>
        </ol>
        <p>
            <br/>
        </p>
        <p>
            <strong>其他注意事项：</strong>
        </p>
        <ol class=" list-paddingleft-2" style="list-style-type: decimal;">
            <li>
                <p>
                    请尽量新开个钱包来使用机器人，<strong><br/></strong>
                </p>
            </li>
            <li>
                <p>
                    当前功能仅在钱包只信任了RIppleFox网关下测试通过，并且只持有XLM和CNY。
                </p>
            </li>
            <li>
                <p>
                    需要全程保持浏览器的这个页面是开着，机器人才会自动下单，
                </p>
            </li>
            <li>
                <p>
                    仅在Chrome浏览器下测试，请优先使用Chrome。<br/>
                </p>
            </li>
        </ol>
        <p>
            <br/>
        </p>
        <p>
            如有疑问，通过Telegram可以找到我，<a href="https://t.me/ety001" target="_self">https://t.me/ety001</a>，&nbsp;或者微博：<a href="http://weibo.com/ety001">http://weibo.com/ety001</a> 
        </p>
        <p>
            接受捐赠：恒星钱包地址为，<span style="color: rgb(51, 51, 51); font-family: &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; font-size: 14px;">GCRF5BWQLVAEDIE4J25KJ5XKC3JI5XKPCT2BA7PZD7B2SW3LSPVX5ENC</span>。
        </p>
        <p>
            <br/>
        </p>
      </div>
    </el-col>
  </el-row>
</template>
<script>
export default {
  name: 'tutorial',
  data () {
    return {
    }
  },
  mounted () {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
