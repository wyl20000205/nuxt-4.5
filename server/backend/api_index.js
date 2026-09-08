import express from 'express'
import tool from './tool'
import { createPendingRecharge, creditRecharge, getOrCreatePlayer } from './doudizhu_store.js'
let route = express.Router()


route.post('/init', (req, res) => {
    let id = 2
    let a = tool.set_token({ id }, 2000)
    // console.log(a);
    res.send({ data: 'ok' })
})

route.post('/query_info', async (req, res) => {
    let { value } = req.body
    let b = tool.check_token(value)
    if (b == null) {
        res.send({ data: 401 })
    } else {
        let data = await tool.get_info(b.id)
        res.send({ data })
    }
})

route.post('/login', async (req, res) => {
    let { user, pass } = req.body
    // console.log(user, pass);
    let db_data = await tool.login({ user, pass })
    if (db_data === null) {
        res.send({ code: 401, msg: 'error' })
    } else {
        const token = tool.set_token({ id: db_data.id, user: db_data.user }, 3600)
        res.send({
            code: 200,
            msg: 'success',
            data: { id: db_data.id, user: db_data.user, token },
        })
    }

})
route.post('/register', async (req, res) => {
    try {
        let result = await tool.register(req.body)
        if (result.code === 200 && result.data) {
            result.data.token = tool.set_token({
                id: result.data.id,
                user: result.data.user,
            }, 3600)
        }
        res.send(result)
    } catch (error) {
        res.status(500).send({ code: 500, msg: 'REGISTER_ERROR' })
    }
})

route.post('/verify_token', (req, res) => {
    const token = req.headers.authorization || req.body?.token
    const user = tool.check_token(token)
    if (!user) {
        return res.status(401).send({ code: 401, msg: 'TOKEN_INVALID' })
    }
    res.send({
        code: 200,
        msg: 'TOKEN_VALID',
        data: { id: user.id, user: user.user },
    })
})

route.post('/send_mail', async (req, res) => {
    let { mail, content } = req.body
    res.send({ code: 2000 })
})

route.post('/pay', async (req, res) => {
  try {
    let { type, trade, info, uid } = req.body
    let data = null
    if (type == 'pay') {
      if (info?.purpose === 'doudizhu') {
        const playerKey = normalizePlayerKey(info.playerKey)
        const price = Number(info.price)
        if (!playerKey || !Number.isFinite(price) || price !== 0.01) {
          return res.status(400).send({ data: { code: '40004', msg: '斗地主单次充值金额只能为 0.01 元' } })
        }
        await getOrCreatePlayer(playerKey, info.nickname)
      }
      data = await tool.alipay('pay', info);
      if (info?.purpose === 'doudizhu' && data?.code === '10000' && data?.outTradeNo) {
        await createPendingRecharge(info.playerKey, info.nickname, data.outTradeNo, 1)
      }
    }
    else if (type == 'query') { //购买菜品轮询查询
        data = await tool.alipay('query', { trade });
        let { code, tradeStatus, outTradeNo } = data
        if (code == '10000' && tradeStatus == 'TRADE_SUCCESS') {
            let flag = await tool.get_out_trade_on(outTradeNo)
            if (!flag) {
                info.fid = info.id
                info.out_trade_no = outTradeNo
                info.user_name = req.user_name
                let { fid } = info
                let bill_data = (await tool.get_user_bill(uid))[0]
                await tool.set_user_bill({ uid, fid, type: '扫码购买', old_price: bill_data.new_price, new_price: bill_data.new_price, change_price: info.price })
                await tool.add_trade('insert', info)
                await tool.add_out_trade_on(outTradeNo)
            }
        }
    } else if (type == 'add_query') { //余额充值轮询查询
        data = await tool.alipay('query', { trade });
        let { code, tradeStatus, outTradeNo } = data
        if (code == '10000' && tradeStatus == 'TRADE_SUCCESS') {
            let flag = await tool.get_out_trade_on(outTradeNo)
            let add_price = parseFloat(data.totalAmount)
            if (!flag) {
                let bill_data = (await tool.get_user_bill(uid))[0]
                bill_data.change_price = bill_data.new_price - bill_data.old_price
                await tool.set_user_bill({ uid, fid: '-1', type: '扫码充值', old_price: bill_data.new_price, new_price: bill_data.new_price + add_price, change_price: add_price })
                await tool.add_out_trade_on(outTradeNo)
                await tool.set_user_price('add', uid, add_price)
            }
        }
    } else if (type == 'demo_query') { //支付演示页只读查询，不写入业务数据
        data = await tool.alipay('query', { trade });
    } else if (type == 'game_query') {
        const playerKey = normalizePlayerKey(info?.playerKey)
        if (!playerKey || typeof trade !== 'string' || !trade.startsWith('ddz_')) {
          return res.status(400).send({ data: { code: '40004', msg: '充值订单参数无效' } })
        }
        data = await tool.alipay('query', { trade });
        if (data?.code === '10000' && data?.tradeStatus === 'TRADE_SUCCESS') {
          const amountCents = Math.round(Number(data.totalAmount) * 100)
          const credited = await creditRecharge(playerKey, info?.nickname, data.outTradeNo, amountCents)
          data.gameCredit = credited
        }
    }
    res.send({ data })
  } catch (error) {
    console.error('[pay error]', error)
    res.status(500).send({ data: { code: '50000', msg: '支付服务暂时不可用' } })
  }
})

function normalizePlayerKey(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{8,64}$/.test(value) ? value : ''
}
export default route
