import jwt from 'jsonwebtoken'
import config from "./config"

import { AlipaySdk } from "alipay-sdk";


let { db, token_secret, upload } = config

const alipaySdk = new AlipaySdk({
    appId: config.alipay.id,
    privateKey: config.alipay.privateKey,
    alipayPublicKey: config.alipay.publicKey
});

export default {
    //上传文件中间件
    upload,
    //生成token
    set_token(obj, time = 3600) { //
        const expiresIn = Number.isFinite(Number(time)) && Number(time) > 0
            ? Number(time)
            : 3600
        return jwt.sign(obj, token_secret, { expiresIn, algorithm: 'HS512' })
    },
    //验证token
    check_token(token) {
        if (typeof token !== 'string' || !token.trim()) return null
        const normalizedToken = token.replace(/^Bearer\s+/i, '').trim()
        try {
            return jwt.verify(normalizedToken, token_secret, {
                algorithms: ['HS512'],
            })
        } catch {
            return null
        }
    },
    async get_info(id) {
        return new Promise((resolve, reject) => {
            db.execute("select * from award where id = ?", [id], (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result[0])
                }
            })
        })
    },

    async login(info) {
        let { user, pass } = info
        return new Promise((resolve, reject) => {
            db.execute("select * from t_user where  user = ? and pass =?", [user, pass], (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result[0] ?? null)
                }
            })
        })
    },
    async get_user_id(id) {
        return new Promise((resolve, reject) => {
            db.execute("select * from t_user where id = ?", [id], (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result[0] ?? null)
                }
            })
        })
    },
    async register(info) {
        let { user, pass1, pass2 } = info
        if (
            typeof user !== 'string' ||
            typeof pass1 !== 'string' ||
            typeof pass2 !== 'string' ||
            !user.trim() ||
            !pass1 ||
            !pass2
        )
            return { code: 400, msg: 'INVALID_INPUT' }
        user = user.trim()

        if (pass1 !== pass2) {
            return { code: 400, msg: 'PASSWORD_MISMATCH' }
        }

        return new Promise((resolve, reject) => {
            db.execute("select id from t_user where user = ? limit 1", [user], (err, result) => {
                if (err) {
                    return reject(err);
                }

                if (result.length) {
                    return resolve({ code: 409, msg: 'USER_EXISTS' })
                }

                db.execute(
                    "insert into t_user (user, pass) values (?, ?)",
                    [user, pass1],
                    (insertErr, insertResult) => {
                        if (insertErr) {
                            if (insertErr.code === 'ER_DUP_ENTRY') {
                                return resolve({ code: 409, msg: 'USER_EXISTS' })
                            }
                            return reject(insertErr)
                        }
                        resolve({
                            code: 200,
                            msg: 'REGISTER_SUCCESS',
                            data: {
                                id: insertResult.insertId,
                                user,
                            },
                        })
                    }
                )
            })
        })
    },
    async alipay(type, info) {
        let data = null;

        if (type == 'pay') {
            const isDoudizhu = info?.purpose === 'doudizhu';
            data = alipaySdk.exec("alipay.trade.precreate", {
                bizContent: {
                    out_trade_no: (isDoudizhu ? "ddz_" : "yumao_") + Math.ceil(Math.random() * 100000000000),
                    total_amount: Number(info.price),
                    subject: isDoudizhu ? "斗地主金币充值" : "一颗大白菜",
                },
            });
        } else if (type == 'query') {
            data = alipaySdk.exec("alipay.trade.query", {
                bizContent: {
                    out_trade_no: info.trade,
                },
            });
        }
        return data
    },

}
