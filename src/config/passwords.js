// 密碼不存 Firebase。這裡存的是密碼的 SHA-256 hash（hex），不是明文，
// 驗證時用 Web Crypto API 把輸入值雜湊後比對（見 utils/hashPassword.js）。
//
// ⚠️ 注意：這仍非真正的安全機制——hash 會出現在公開的前端 bundle，
//    4 位數密碼可被暴力破解。它只是「不在原始碼留明文」的輕度遮蔽，
//    用途仍是防止學員誤操作。若需真正安全請改用 Firebase Authentication。
//
// 目前對應的明文：leader=1234, gamemaster=5678, admin=0000
//
// 要換新密碼？在瀏覽器 Console 貼上以下腳本算出 hash 再填回來：
//
//   (async () => {
//     const enc = new TextEncoder();
//     for (const pw of ['你的隊輔密碼', '你的關主密碼', '你的管理員密碼']) {
//       const buf = await crypto.subtle.digest('SHA-256', enc.encode(pw));
//       const hex = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
//       console.log(pw, '=>', hex);
//     }
//   })();

export const PASSWORDS = {
  leader: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
  gamemaster: 'f8638b979b2f4f793ddb6dbd197e0ee25a7a6ea32b0ae22f5e3c5d119d839e75',
  admin: '9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0',
}
