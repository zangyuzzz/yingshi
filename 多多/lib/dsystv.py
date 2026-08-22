#!/usr/bin/python
# -*- coding: utf-8 -*-
import re, json, requests
from urllib.parse import quote
try:
    from lxml import etree
except Exception:
    etree = None
from base.spider import Spider


class Spider(Spider):
    def getName(self): return "袋鼠影视"

    def init(self, extend=""):
        self.host = "https://dsystv.com"
        try: ext = json.loads(extend) if str(extend).strip().startswith("{") else {}
        except Exception: ext = {}
        if ext.get("host"): self.host = ext["host"].rstrip("/")
        self.headers = {"User-Agent": ext.get("ua", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"), "Referer": self.host + "/", "Accept-Language": "zh-CN,zh;q=0.9"}
        self.categories = [{"type_id": "1", "type_name": "电影"}, {"type_id": "2", "type_name": "电视剧"}, {"type_id": "3", "type_name": "综艺"}, {"type_id": "4", "type_name": "动漫"}, {"type_id": "44", "type_name": "短剧"}]
        self.subs = {"1": [["全部", "1"], ["动作片", "5"], ["喜剧片", "10"], ["科幻片", "7"], ["恐怖片", "8"], ["战争片", "9"], ["动画片", "41"], ["剧情片", "12"], ["爱情片", "6"], ["纪录片", "11"]],
                     "2": [["全部", "2"], ["国产剧", "13"], ["港台剧", "14"], ["欧美剧", "15"], ["日韩剧", "16"], ["海外剧", "42"]]}
        self.orders = [["默认", ""], ["最近更新", "time"], ["总排行", "hit"], ["月排行", "monthhit"], ["周排行", "weekhit"], ["豆瓣评分", "douban"]]

    def _fix(self, u):
        if not u: return ""
        if u.startswith("//"): return "https:" + u
        if u.startswith("/"): return self.host + u
        return u

    def _get(self, path):
        url = path if path.startswith("http") else self.host + path
        try:
            r = requests.get(url, headers=self.headers, timeout=15); r.encoding = "utf-8"
            if r.status_code >= 400: print("[WARN] status=%s url=%s" % (r.status_code, url))
            return r.text
        except requests.exceptions.Timeout: print("[ERROR] 请求超时: %s" % url)
        except requests.exceptions.ConnectionError: print("[ERROR] 连接错误: %s" % url)
        except Exception as e: print("[ERROR] 请求失败: %s, %s" % (url, str(e)))
        return None

    def _post(self, path, data):
        try:
            r = requests.post(self.host + path, data=data, headers=self.headers, timeout=15); r.encoding = "utf-8"; return r.text
        except Exception as e: print("[ERROR] POST失败: %s, %s" % (path, str(e))); return None

    def _parse_list(self, html):
        if not html: return []
        if etree is None:
            print("[WARN] lxml 不可用，降级为正则解析")
            out, seen = [], set()
            for vid, title in re.findall(r'href="[^"]*?/movie/index(\d+)\.html"[^>]*?title="([^"]*)"', html):
                if vid in seen: continue
                seen.add(vid); out.append({"vod_id": vid, "vod_name": title, "vod_pic": ""})
            return out
        tree = etree.HTML(html); results, seen = [], set()
        items = tree.xpath('//a[contains(@class,"videopic") and contains(@href,"/movie/index")]') + tree.xpath('//div[contains(@class,"item")]//a[contains(@href,"/movie/index") and .//img]') + tree.xpath('//a[contains(@href,"/movie/index") and .//img]')
        for it in items:
            try:
                m = re.search(r'/movie/index(\d+)\.html', it.get("href", ""))
                if not m or m.group(1) in seen: continue
                name = (it.get("title") or "".join(it.xpath('.//img/@alt')[:1])).strip()
                if not name: continue
                seen.add(m.group(1))
                pic = ""
                for at in ("data-original", "data-src", "data-echo", "data-lazy", "src"):
                    cand = it.xpath('.//img/@%s' % at)
                    if cand and "load.gif" not in cand[0] and "loading" not in cand[0]: pic = cand[0]; break
                note = " ".join(x.strip() for x in it.xpath('.//span//text()') if x.strip())
                results.append({"vod_id": m.group(1), "vod_name": name, "vod_pic": self._fix(pic), "vod_remarks": note[:40]})
            except Exception: continue
        return results

    def _parse_playlist(self, tree, vid):
        groups = {}
        for a in tree.xpath('//a[contains(@href,"/play/")]'):
            m = re.search(r'/play/%s-(\d+)-(\d+)\.html' % vid, a.get("href", ""))
            if not m: continue
            s, e = int(m.group(1)), int(m.group(2))
            nm = (a.get("title") or "".join(a.xpath('.//text()'))).strip()
            groups.setdefault(s, {}).setdefault(e, [])
            if nm: groups[s][e].append(nm)
        froms,