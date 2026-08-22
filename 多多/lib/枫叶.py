# -*- coding: utf-8 -*-
import re, urllib.parse
import json
import time
from bs4 import BeautifulSoup
import requests
from base.spider import Spider as BaseSpider


class Spider(BaseSpider):
    # 缓存变量，避免频繁请求发布页
    _cache_host = ""
    _cache_time = 0
    CACHE_DURATION = 300  # 缓存5分钟

    def init(self, extend=""):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9",
        }

        # 优先读取缓存，没有或过期则重新获取
        now = time.time()
        if self._cache_host and now - self._cache_time < self.CACHE_DURATION:
            self.host = self._cache_host
        else:
            publish_url = "https://www.vip1949.com/"
            self.host = self.get_online_host(publish_url)
            self._cache_host = self.host
            self._cache_time = now

    def get_online_host(self, publish_url):
        """从发布页解析JS域名列表，返回第一个在线可用主站"""
        try:
            resp = requests.get(publish_url, headers=self.headers, timeout=15)
            resp.raise_for_status()
            html = resp.text

            # 正则提取JS中的domains数组
            pattern = r'const domains = (\[.*?\]);'
            match = re.search(pattern, html, re.S)
            if not match:
                return "https://www.cd-zj.com"

            js_str = match.group(1)
            # 修复JS对象格式为标准JSON
            js_str = re.sub(r'(\w+)\s*:', r'"\1":', js_str)
            js_str = re.sub(r'"+', '"', js_str)
            domains = json.loads(js_str)

            # 逐个检测连通性，返回第一个可用
            for item in domains:
                url = item["url"]
                if self