<template>
  <div class="glass announce">
    <CardHead icon="megaphone" :title="title" mb="12px">
      <span class="social">
        <a
          v-for="s in socialLinks"
          :key="s.name"
          :href="s.url"
          target="_blank"
          rel="noopener"
          :data-tip="s.tip"
          :aria-label="s.name"
        >
          <Icon :name="s.icon" :size="16" />
        </a>
      </span>
    </CardHead>

    <ul v-if="items.length" class="memos">
      <li v-for="m in items" :key="m.id">
        <a :href="m.link" target="_blank" rel="noopener" class="memo">
          <span class="memo-meta">
            <Icon name="clock" :size="12" />
            <time v-if="m.time" :datetime="m.datetime" :title="fullTime(m.time)">
              {{ fmtTime(m.time) }}
            </time>
            <span v-if="m.pinned" class="badge">
              <Icon name="pin" :size="11" />置顶
            </span>
            <span v-if="m.hasImage" class="pic" title="含图片">
              <Icon name="image" :size="12" />
            </span>
          </span>
          <span class="memo-text">{{ m.text }}</span>
        </a>
      </li>
    </ul>
    <p v-else-if="loading" class="tip">正在获取{{ title }}…</p>
    <p v-else-if="failed" class="tip">
      {{ title }}加载失败，<a v-if="memosBase" :href="memosBase" target="_blank" rel="noopener">去 Memos 看看 →</a>
    </p>
    <p v-else-if="!memosBase" class="tip">未配置 Memos 地址</p>
    <p v-else class="tip">
      暂无公开{{ title }}，<a :href="memosBase" target="_blank" rel="noopener">去 Memos 看看 →</a>
    </p>

    <a v-if="items.length" class="more" :href="memosBase" target="_blank" rel="noopener">
      查看全部 →
    </a>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { siteConfig, socialLinks } from "@/config";
import { cachedFetch } from "@/utils/cachedFetch";
import Icon from "@/components/Icon.vue";
import CardHead from "@/components/CardHead.vue";

const CACHE_MS = 10 * 60 * 1000; // 10 分钟
const PAGE_SIZE = 100; // 多取一些再在前端过滤/排序，避免只能看到别人最新几条

const announcement = siteConfig.announcement || {};
const title = computed(() => String(announcement.title || "公告"));
const memosBase = computed(() => String(announcement.apiUrl || "").replace(/\/+$/, ""));
const memosUser = String(announcement.parent || "").trim();
const limit = Math.max(1, Number(announcement.limit) || 3);

const items = ref([]);
const loading = ref(true);
const failed = ref(false);

// Memos 详情页路由随版本变化：
//  - v0.24 之前：/m/{uid}
//  - v0.24 及之后（含 v1.x）：/memos/{uid}
// 通过实例 profile 接口识别版本，自动选择可用路由
const NEW_ROUTE_SINCE_MINOR = 24;

function parseVersion(v) {
  const m = String(v || "").match(/(\d+)\.(\d+)/);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

async function detectMemoRoute(signal) {
  const endpoints = [
    { path: "instance/profile", route: "memos" },
    { path: "workspace/profile", route: "m" },
  ];
  for (const { path, route } of endpoints) {
    try {
      const res = await fetch(`${memosBase.value}/api/v1/${path}`, {
        signal,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) continue;
      const version = parseVersion((await res.json()).version);
      if (!version) return route;
      const [major, minor] = version;
      return major > 0 || minor >= NEW_ROUTE_SINCE_MINOR ? "memos" : "m";
    } catch {
      // 该接口不可用则尝试下一个
    }
  }
  // 无法识别时按当前版本路由兜底
  return "memos";
}

// 与 Firefly 的动态一致：置顶优先，其余按发布时间从新到旧
function toItem(memo, route) {
  const time = Date.parse(memo.createTime || memo.displayTime || "") || 0;
  const uid = String(memo.name || memo.id || "").split("/").pop();
  const id = uid || `memo-${time}`;
  const attachments = Array.isArray(memo.attachments) ? memo.attachments : [];
  return {
    id,
    time,
    datetime: time ? new Date(time).toISOString() : "",
    text: plainText(memo.content),
    pinned: !!memo.pinned,
    hasImage:
      /!\[[^\]]*\]\([^)]+\)/.test(memo.content || "") ||
      attachments.some((a) => String(a.type || "").startsWith("image/")),
    link: uid ? `${memosBase.value}/${route}/${uid}` : memosBase.value,
  };
}

// Memos 的 Markdown → 卡片摘要纯文本：图片只保留“含图片”标识，链接保留文字
function plainText(md) {
  return String(md || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s*(?:#{1,6}|[-+*>])\s+/gm, "")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchMemos(signal) {
  const url = new URL(`${memosBase.value}/api/v1/memos`);
  url.searchParams.set("pageSize", String(PAGE_SIZE));
  if (memosUser) url.searchParams.set("parent", memosUser);

  const [route, data] = await Promise.all([
    detectMemoRoute(signal),
    fetch(url, { signal, headers: { Accept: "application/json" } }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),
  ]);

  return (data.memos || [])
    .filter((m) => !m.state || m.state === "NORMAL")
    // ListMemos 的 parent 不一定真的按 creator 过滤，这里再兜一层
    .filter((m) => (memosUser ? m.creator === memosUser : true))
    .map((m) => toItem(m, route))
    .sort((a, b) => b.pinned - a.pinned || b.time - a.time)
    .slice(0, limit);
}

onMounted(async () => {
  if (!memosBase.value) {
    loading.value = false;
    return;
  }
  try {
    items.value = await cachedFetch({
      key: `announce_memos:${memosBase.value}:${memosUser}`,
      ttl: CACHE_MS,
      loader: fetchMemos,
    });
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
});

// 近期用相对时间，更早的显示为日期
function fmtTime(ts) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const min = 60 * 1000;
  const hour = 60 * min;
  const day = 24 * hour;
  if (diff >= 0 && diff < min) return "刚刚";
  if (diff >= 0 && diff < hour) return `${Math.floor(diff / min)} 分钟前`;
  if (diff >= 0 && diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff >= 0 && diff < 7 * day) return `${Math.floor(diff / day)} 天前`;
  return dateStr(ts);
}

function fullTime(ts) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, "0");
  return `${dateStr(ts)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function dateStr(ts) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
</script>

<style scoped>
.announce {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
}

.social {
  display: flex;
  gap: 6px;
}

.social a {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  color: var(--text-dim);
  transition: all 0.3s ease;
}

.social a:hover {
  color: var(--text);
  background: var(--glass-strong);
  transform: translateY(-2px);
}

.memos {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.memo {
  display: block;
  min-width: 0;
  padding: 8px 10px;
  border-radius: 9px;
  transition: background 0.25s ease;
}

.memo-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  line-height: 1.4;
  color: var(--accent1);
}

.memo-meta time {
  flex-shrink: 0;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(129, 140, 248, 0.16);
  color: var(--accent1);
  font-size: 0.66rem;
  line-height: 1.5;
  flex-shrink: 0;
}

.pic {
  margin-left: auto;
  display: inline-flex;
  color: var(--text-dim);
  opacity: 0.7;
}

.memo-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin-top: 3px;
  font-size: 0.86rem;
  line-height: 1.55;
  color: var(--text-dim);
  overflow-wrap: anywhere;
  transition: color 0.25s ease;
}

.memo:hover {
  background: var(--glass-strong);
}

.memo:hover .memo-text {
  color: var(--text);
}

.tip {
  color: var(--text-dim);
  font-size: 0.84rem;
  line-height: 1.6;
}

.tip a {
  color: var(--accent1);
  transition: color 0.25s ease;
}

.tip a:hover {
  color: var(--text);
}

.more {
  margin-top: auto;
  align-self: flex-end;
  padding: 10px 10px 4px;
  font-size: 0.78rem;
  color: var(--text-dim);
  border-radius: 9px;
  transition: color 0.25s ease, background 0.25s ease;
}

.more:hover {
  color: var(--text);
  background: var(--glass-strong);
}
</style>
