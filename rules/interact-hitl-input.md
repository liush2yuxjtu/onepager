---
title: HITL Credential-Entry Input Gateway
impact: HIGH
impactDescription: 违反则人类不知填什么、凭据明文外泄或单通道卡死，流程无法继续
tags: onepager, interact, hitl, password, apikey, qr, secret, 2fa
---

## HITL 人机凭据窄门：密码 / 密钥 / 验证码 / 二维码

交付物需要人类提供**凭据**才能继续（输密码 / 填 API key / 填 token / 输 2FA 验证码 / 扫二维码）时，页面就是人↔agent 的凭据通道。必须给**凭据输入框**、**安全显示**、**扫码/复制出口**，并让「在等什么 / 从哪拿 / 多久过期」可见——否则人不知道填啥、secret 明文外泄、流程永久卡死。

**Incorrect（明文输入、格式不清、凭据可能外泄）：**

```html
<!-- type="text" 明文；无格式提示；无遮蔽；无过期说明 -->
<input type="text" placeholder="key">
<button onclick="send(key)">提交</button>
```

**Correct（遮蔽 + 格式 + 切换明文 + 本地校验 + 过期可见）：**

```html
<!-- 密码 / 密钥：type="password"，placeholder 写格式，👁 切换明文 -->
<div class="credfield">
  <input id="apikey" type="password" placeholder="sk-...（云平台 API key）" autocomplete="off">
  <button type="button" onclick="toggleReveal('apikey')">👁</button>
  <button type="button" onclick="copySecret('apikey')">复制</button>
</div>
<button onclick="submitKey()">提交（Enter 亦可）</button>
<script>
function toggleReveal(id){
  var el=document.getElementById(id);
  el.type = el.type==='password' ? 'text' : 'password';
}
function submitKey(){
  var v=document.getElementById('apikey').value.trim();
  if(!/^sk-[A-Za-z0-9]{8,}$/.test(v)){ toast('格式不对：应为 sk- 开头'); return; }  // 即时反馈，不吞
  statusEl.textContent='已就绪 ✓';  // 结果可复制 Markdown 回传 agent
  document.getElementById('apikey').value='';  // 完成后清空，防明文残留
}
</script>

<!-- 二维码：data URI 或手写 SVG 内联，正文可见，带过期倒计时 -->
<img src="data:image/png;base64,..." alt="2FA 扫码" style="max-width:220px">
<div>二维码 60 秒后过期 · <button onclick="refreshQR()">刷新</button></div>
```

**Why:** HITL 凭据的价值是「人类把 secret 递进流程、流程把状态反馈给人」的闭环。密码/密钥必须 `type="password"` 遮蔽 + 可切明文核对；placeholder 写格式、提交时格式校验 + toast 即时反馈，人才能一次填对；二维码必须内联可见（data URI / 手写 SVG），带过期倒计时，手机秒扫；复制 + 粘贴多出口，任一可用即继续。等待态必须标注「在等什么 / 从哪拿 / 多久过期」+ 失败重试与过期兜底。安全纪律：secret 默认遮蔽、不落明文 DOM/日志、页面零远程端点、复制后提示清剪贴板、页脚声明「仅本机使用，不上传服务器」。
