import { DLSITE_ENSPELL_STORAGE_KEY } from "../options/storage.js";

"use strict";
{
  // https://zenn.dev/terrierscript/articles/2021-02-21-java-script-number-format-compact
  let fullFormat = (number) => {
    const formatter = new Intl.NumberFormat("ja-JP",{ 
      notation: "compact",
      useGrouping: false,
      maximumFractionDigits: 0
    })
    const fmt = (number, result = []) => {
      const bigIntNum = BigInt(number)
      const [num,notation] = formatter.formatToParts(bigIntNum)
      const numStr = bigIntNum.toString()
      if(notation === undefined){
        return [...result, numStr].join("")
      }
      const dig = num.value.length
      const value = numStr.slice(0,dig)
      const next = numStr.slice(dig)

      return fmt(next, [...result,`${value}${notation.value}`])
    }
    return fmt(number)
  }

  let observer = new MutationObserver(function() {
    if (document.querySelector('#work_price [itemprop="offers"] .price')) {
      let sales_count = parseInt(document.querySelector(".work_right_info_title.value > .point").textContent.replace(/,/g, ""))
      let normal_price = parseInt(document.querySelector('#work_price .work_buy_content').textContent.trim().slice(0, -1).replace(/,/g, ""))
      let sale_price = parseInt(document.querySelector('#work_price [itemprop="offers"] .price').textContent.slice(0, -1).replace(/,/g, ""))

      let min = sales_count * sale_price
      let max = sales_count * normal_price
      chrome.storage.sync.get(DLSITE_ENSPELL_STORAGE_KEY, (data)=>{
        let settings = data[DLSITE_ENSPELL_STORAGE_KEY] || {};

        if (settings.show_estimate == false) {
          return;
        }

        let target_dom = document.querySelector('#work_right .work_right_info')

        let formated_text = ""
        if(settings.estimate_format == '123,456円'){
          formated_text = `${min.toLocaleString()}円 ～ ${max.toLocaleString()}円`
        }else{
          formated_text = `${fullFormat(min)}円 ～ ${fullFormat(max)}円`
        }

        let insert_dom = 
          `<div class="work_right_info_item">
          <dl class="work_right_info_title">
          <dt class="work_right_info_title">推定売上額：</dt>
          <dd class="position_fix"><span class="${settings.estimate_text_design == 'ゴールドのテキスト' ? "gold" : ""}">${formated_text}</span>
          </dd></dl></div>`

          target_dom.insertAdjacentHTML('beforeend', insert_dom)
      })
      observer.disconnect()
    }
  })
  observer.observe(document, {childList: true, subtree: true})
}