window.__DLSITE_ENSPELL__ = window.__DLSITE_ENSPELL__ || {};
window.__DLSITE_ENSPELL__.MyComponent = {
    template: `
<div>
  <div>
    <label>ソート: </label>
    <select v-model="selectedSort" @change="sortReviews">
      <option value="entry_date-desc">投稿日が新しい順</option>
      <option value="entry_date-asc">投稿日が古い順</option>
      <option value="rate-desc">評価が高い順</option>
      <option value="rate-asc">評価が低い順</option>
      <option value="good_review-desc">役に立った数が多い順</option>
      <option value="good_review-asc">役に立った数が少ない順</option>
    </select>
  </div>

  <div v-for="review in sortedReviews" :key="review.member_review_id" itemprop="review" itemscope="itemscope" itemtype="https://schema.org/Review" class="review_inner">
    <div class="review_contents">
      <div class="review_header review_contents_inner">
        <div class="review_header_inner type_push">
          <ul class="review_push_list">
          </ul>
        </div>
        <div class="review_header_inner type_title">
          <div class="review_title_wrap">
            <div class="review_star">
              <span :class="'rate type_review rate' + review.rate * 10"></span>
            </div>
            <div class="reveiw_title">
              <span itemprop="name" class="reveiw_title_item">
                <a :href="'/maniax/work/reviewlist/=/reviewer/' + review.reviewer_id + '/product_id/' + review.workno + '/'">
                  {{ review.review_title }}
                </a>
              </span>
            </div>
          </div>
        </div>
        <div class="review_header_inner type_info">
          <div class="review_info_wrap">
            <div class="review_info_top">
              <div class="reveiw_date">
                <p class="reveiw_date_item">{{ review.entry_date }}</p>
                <meta itemprop="entry_date" :content="review.entry_date">
              </div>
              <div class="reveiw_author">
                <span itemprop="author" itemscope="itemscope" itemtype="https://schema.org/Person" class="reveiw_author_item">
                  <span itemprop="name">
                    <a :href="'/maniax/reviewlist/=/reviewer/' + review.reviewer_id + '/'">{{ review.nick_name }}</a>さん
                  </span>
                </span>
              </div>
              <div class="reveiw_purchased">
                <span class="icon_purchased" v-if="review.is_purchased">購入済み</span>
              </div>
              <div class="reveiw_rank" v-if="review.reviewer_rank">
                <span :class="getReviewerRankClass(review.reviewer_rank)">
                  人気レビュアー&nbsp;{{ review.reviewer_rank }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="review_main review_contents_inner">
        <div v-if="review.spoiler == '1' && !spoilerVisible[review.member_review_id]">
          <div class="review_attention">
            <p class="review_attention_item">
              <a href="#" @click.prevent="revealSpoiler(review.member_review_id)">このレビューにはネタバレが含まれています。</a>
            </p>
          </div>
        </div>
        <div v-if="review.spoiler != '1' || spoilerVisible[review.member_review_id]">
          <p class="review_desc" v-html="review.review_text"></p>
        </div>
      </div>
      <div class="review_genre review_contents_inner">
        <p class="review_genre_headline">レビュアーが選んだジャンル</p>
        <ul class="review_select_genre">
          <li v-for="[key, value] in Object.entries(review.genre)" :key="key" class="review_select_genre_item">
            <a :href="'/maniax/fsr/=/genre/' + key + '/'" class="btn_default">{{ value }}</a>
          </li>
        </ul>
      </div>
      <div class="review_reference review_contents_inner">
        <div class="review_reference_inner type_useful">
          <div class="review_useful">
            <span class="useful_num">{{ review.good_review }}人 が役に立ったと答えています</span>
          </div>
        </div>
        <div class="review_reference_inner type_reference">
          <div class="review_reference_btn_wrap">
            <input value="役に立った" type="button" class="_btn_good_review btn_default" @click="submitReviewReferenceMessage(review.member_review_id, review.workno)">
          </div>
          <div class="review_report">
            <span class="review_report_item">
              <a :href="'/maniax/contact/review/=/reviewer_id/' + review.reviewer_id + '/product_id/' + review.workno + '/'">報告する</a>
            </span>
          </div>
        </div>
        <div class="review_reference_inner type_message" v-if="review_reference_messages[review.member_review_id]">
          <div class="review_reference_message_wrap">
            <p class="review_reference_message _review_message">
              {{ review_reference_messages[review.member_review_id] }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
    `,
    data() {
      return {
          selectedSort: "entry_date-desc",
          reviews: [],
          review_reference_messages: {},
          spoilerVisible: {},
      };
    },
    created() {
      this.fetchReviews();
    },
    computed: {
      sortedReviews() {
        const [sortKey, sortOrder] = this.selectedSort.split("-");
        return [...this.reviews].sort((a, b) => {
          let result = 0;
          if (sortKey === "entry_date") {
            result = new Date(a.entry_date) - new Date(b.entry_date);
          } else if (sortKey === "rate") {
            result = a.rate - b.rate;
          } else if (sortKey === "good_review") {
            result = a.good_review - b.good_review;
          }
          return sortOrder === "desc" ? -result : result;
        })
        .map(review => ({
          ...review,
          review_text: review.review_text.replace(/\n/g, "<br>"),
          entry_date: this.formatDate(review.entry_date)
        }));
      }
    },
    methods: {
      sortReviews() {
        this.$forceUpdate();
      },
      async fetchReviews() {
        this.reviews = [{
            "member_review_id": "1689838",
            "workno": "RJ01219535",
            "reviewer_id": "REV0120167",
            "status": "1",
            "recommend": "1",
            "spoiler": "0",
            "review_title": "\u629c\u304d\u30b2\u30fc\u3068\u3057\u3066\u306f\u6700\u9ad8\u306a\u306e\u306b\u8ca9\u58f2\u7ba1\u7406\u304c\u6700\u60aa",
            "review_text": "\u629c\u304d\u30b2\u30fc\u3068\u3057\u3066\u306f\u6700\u9ad8\u3002\u307e\u3055\u306b\u6700\u9ad8\u30ec\u30d9\u30eb\u3002\n\u4ed6\u306e\u4eba\u306b\u3082\u52e7\u3081\u305f\u3044\u5185\u5bb9\u3067\u3042\u308a\u3001\u30ad\u30e3\u30e9\u30af\u30bf\u30fc\u30c7\u30b6\u30a4\u30f3\u3084\n\u30a8\u30ed\u30a4\u30d9\u30f3\u30c8\u3082\u591a\u5f69\u3002\u7279\u306b\u30dc\u30c6\u8179\u7cfb\u304c\u6027\u7656\u306e\u4eba\u306b\u306f\n\u795e\u30b2\u30fc\u6271\u3044\u3055\u308c\u3066\u3082\u304a\u304b\u3057\u304f\u306a\u3044\u3002\u81ea\u5206\u3082\u305d\u3046\u3002\n\n\u2026\u3051\u3069\u305d\u308c\u3089\u3092\u901a\u308a\u8d8a\u3057\u3066\u661f\u4e00\u3064\u306a\u306e\u306f\u3001\n\u30b5\u30fc\u30af\u30eb\u306e\u7ba1\u7406\u304c\u3042\u307e\u308a\u306b\u3082\u675c\u64b0\u3059\u304e\u305f\u3002\n\u3053\u306e\u72b6\u614b\u3067\u51fa\u8377\u3059\u308b\u306a\u3089\u3001\u8ca9\u58f2\u3092\u3082\u3046\u4e00\u30f5\u6708\u4f38\u3070\u3057\u3066\n\u30c6\u30b9\u30c8\u30d7\u30ec\u30a4\u306b\u96c6\u4e2d\u3059\u3079\u304d\u3060\u3063\u305f\u3002",
            "entry_date": "2025-02-07 10:39:43",
            "regist_date": "2025-02-07 14:05:01",
            "good_review": "13",
            "bad_review": "0",
            "circle_id": "RG25631",
            "nick_name": "aana",
            "popularity": null,
            "rate": "1",
            "circle_name": "\u3042\u305b\u308d\u3089",
            "top_sort_key": "2",
            "reviewer_status": "active",
            "is_purchased": "1",
            "rate_num": "10",
            "reviewer_rank": "",
            "longtext": false,
            "genre": {
              "065": "\u304a\u3063\u3071\u3044",
              "432": "\u5973\u4e3b\u4eba\u516c",
              "533": "\u6226\u95d8\u30a8\u30ed",
              "132": "\u51fa\u7523",
              "128": "\u4e2d\u51fa\u3057",
              "129": "\u598a\u5a20\/\u5b55\u307e\u305b",
              "193": "\u51e6\u5973",
              "190": "\u30d5\u30bf\u30ca\u30ea",
              "186": "\u307c\u3066\u8179\/\u598a\u5a66",
              "204": "\u8840\u6db2\/\u6d41\u8840"
            }
          },
          {
            "member_review_id": "1675683",
            "workno": "RJ01219535",
            "reviewer_id": "REV0144083",
            "status": "1",
            "recommend": "0",
            "spoiler": "0",
            "review_title": "\u4eca\u5f8c\u306e\u30a2\u30d7\u30c7\u306b\u671f\u5f85",
            "review_text": "\u307e\u305a\u3001\u30ad\u30e3\u30e9\u30af\u30bf\u30fc\u306b\u60f9\u304b\u308c\u307e\u3057\u305f\u3002\n\u6226\u95d8\u8863\u88c5\u30d1\u30fc\u30b8\u3084\u3001\u767d\u6fc1\u307e\u3067\u3042\u308a\u66f4\u306b\u306f\u6226\u95d8\u30b3\u30de\u30f3\u30c9\u306bH\u306a\u6280\u307e\u3067\u3042\u308b\u3068\u306f\u3002\n\u30b9\u30c8\u30fc\u30ea\u30fc\u3082\u9053\u7b4b\u304c\u3001\u3057\u3063\u304b\u308a\u3057\u3066\u3044\u308b\u306e\u3067\u308f\u304b\u308a\u3084\u3059\u304f\u306e\u3081\u308a\u8fbc\u3081\u308b\u5927\u8846\u5411\u3051\u3067\u3057\u305f\u3002\n\u4eca\u5f8c\u306e\u30a2\u30d7\u30c7\u306b\u3088\u308a\u30ad\u30e3\u30e9\u30af\u30bf\u30fc\u97f3\u58f0\u304c\u8ffd\u52a0\u3055\u308c\u308b\u4e88\u5b9a\u3067\u3059\u304c\u3001\n\u4fa1\u683c\u304c\u3059\u3067\u306b5500\u5186\u3068\u901a\u5e38\u5927\u624b\u30e1\u30fc\u30ab\u30fc\u4f5c\u54c1\u306e\u305d\u308c\u3068\u4ee3\u308f\u308a\u306a\u3044\u306e\u3067\u3059\u3002\u3060\u304b\u3089\u305b\u3081\u3066\u3053\u308c\u3060\u3051\u7d20\u6674\u3089\u3057\u3044\u58f0\u512a\u3055\u3093\u304c\u643a\u308f\u3063\u3066\u3044\u308b\u306e\u306a\u3089\u3070\u767a\u58f2\u65e5\u3068\u540c\u6642\u306b\u5168\u30b7\u30fc\u30f3\u3068\u307e\u3067\u306f\u8a00\u308f\u306a\u3044\u304c\u3001\u30d2\u30ed\u30a4\u30f3\u304c\u95a2\u308f\u308b\u30e2\u30ce\u304f\u3089\u3044\u306f\u901a\u5e38\u3001\u7279\u306bH\u30b7\u30fc\u30f3\u3092\u30d5\u30eb\u30dc\u30a4\u30b9\u3067\u304a\u9858\u3044\u3057\u305f\u304b\u3063\u305f\u3002",
            "entry_date": "2025-01-25 19:12:12",
            "regist_date": "2025-01-26 01:46:57",
            "good_review": "99",
            "bad_review": "0",
            "circle_id": "RG25631",
            "nick_name": "ssyzggg",
            "popularity": "935",
            "rate": "4",
            "circle_name": "\u3042\u305b\u308d\u3089",
            "top_sort_key": "1",
            "reviewer_status": "active",
            "is_purchased": "1",
            "rate_num": "40",
            "reviewer_rank": "Best1000",
            "longtext": false,
            "genre": {
              "432": "\u5973\u4e3b\u4eba\u516c",
              "533": "\u6226\u95d8\u30a8\u30ed",
              "129": "\u598a\u5a20\/\u5b55\u307e\u305b"
            }
          },
          {
            "member_review_id": "1687905",
            "workno": "RJ01219535",
            "reviewer_id": "REV0022134",
            "status": "1",
            "recommend": "1",
            "spoiler": "1",
            "review_title": "\u7740\u305b\u66ff\u3048\u30dc\u30c6\u8179\u597d\u304d\u3055\u3093\u3044\u3089\u3063\u3057\u3083\u3044",
            "review_text": "\u30d7\u30ec\u30a4\u30a2\u30d6\u30eb&\u30dc\u30c6\u8179\u306b\u3067\u304d\u308b\u30ad\u30e3\u30e9\u304c\u904e\u53bb\u6700\u591a\u3002\n\n\u305d\u306e\u5206\u7740\u305b\u66ff\u3048\u3082\u82e5\u5e72\u679a\u6570\u304c\u6e1b\u3063\u3066\u3057\u307e\u3044\u307e\u3059\u304c\u3001\u305d\u308c\u3067\u3082\u5404\u30ad\u30e3\u30e9\u30c7\u30d5\u30a9\u30eb\u30c8\u5408\u308f\u305b\u30664\u7740\u304f\u3089\u3044\u8863\u88c5\u304c\u3042\u308b\u3002\n\u4f55\u3088\u308a\u5168\u8863\u88c5\u30dc\u30c6\u8179\u5dee\u5206\u304c\u3042\u308b\u72c2\u6c17\u306e\u4ed5\u69d8\u3002\n\n\u3055\u3089\u306b\u3001\u65e2\u5b58\u30b7\u30ea\u30fc\u30ba\u3067\u306f\u5973\u306e\u5b50PT\u306e\u305f\u3081\u51e6\u5973\u55aa\u5931\u306e\u76f8\u624b\u3084\u3001\u5b50\u5bae\u3092\u5360\u62e0\u3059\u308b\u5b50\u306e\u7236\u89aa\u304c\u5b9f\u8cea\u7684\u4ed6\u4eba\u306b\u306a\u3063\u3066\u3057\u307e\u3046\u70b9\u3082\u3001\u6761\u4ef6\u3092\u6e80\u305f\u305b\u3070\u3075\u305f\u306a\u308a\u3067PT\u5185\u51e6\u5973\u55aa\u5931&\u5b55\u307e\u305b\u53ef\u80fd\u3002\n\n\u62d8\u675f\u3084\u58c1\u5c3b\u3001\u5bfe\u8907\u6570\u306a\u3069\u69d8\u3005\u306a\u30b7\u30c1\u30e5\u30a8\u30fc\u30b7\u30e7\u30f3\u304c\u76db\u308a\u6ca2\u5c71\u3002",
            "entry_date": "2025-02-05 10:37:23",
            "regist_date": "2025-02-05 16:08:57",
            "good_review": "0",
            "bad_review": "0",
            "circle_id": "RG25631",
            "nick_name": "\u306a\u306a\u30fc\u306a\u306a \u306a\u306a\u306a",
            "popularity": null,
            "rate": "5",
            "circle_name": "\u3042\u305b\u308d\u3089",
            "top_sort_key": "1",
            "reviewer_status": "active",
            "is_purchased": "1",
            "rate_num": "50",
            "reviewer_rank": "",
            "longtext": false,
            "genre": {
              "533": "\u6226\u95d8\u30a8\u30ed",
              "446": "\u58f2\u6625\/\u63f4\u4ea4",
              "158": "\u767e\u5408",
              "324": "\u7570\u7a2e\u59e6",
              "142": "\u6deb\u4e71",
              "114": "\u5f37\u5236\/\u7121\u7406\u77e2\u7406",
              "146": "\u62d8\u675f",
              "129": "\u598a\u5a20\/\u5b55\u307e\u305b",
              "116": "\u8907\u6570\u30d7\u30ec\u30a4\/\u4e71\u4ea4",
              "121": "\u8f2a\u59e6"
            }
          },
          {
            "member_review_id": "1674982",
            "workno": "RJ01219535",
            "reviewer_id": "REV0038712",
            "status": "1",
            "recommend": "1",
            "spoiler": "0",
            "review_title": "\u4e00\u6708\u306e\u671f\u5f85\u4f5c",
            "review_text": "\u4eba\u6c17\u30b5\u30fc\u30af\u30eb\u3067\u3042\u308b\u3001\u3042\u305b\u308d\u3089\u3055\u3093\u306e\u65b0\u4f5cRPG\u3067\u3059\u3002\n\u524d\u56de\u304b\u3089\u9577\u3044\u6642\u9593\u304c\u6d41\u308c\u307e\u3057\u305f\u304c\u3001\u305d\u306e\u5206\u3060\u3051\u8d85\u5927\u4f5c\u306eRPG\u304c\u51fa\u6765\u305f\u3088\u3046\u3067\u3001\u3042\u305b\u308d\u3089\u3055\u3093\u3092\u3054\u5b58\u77e5\u306e\u65b9\u306f\u65e2\u306b\u671f\u5f85\u611f\u3067\u80f8\u304c\u3044\u3063\u3071\u3044\u3067\u3057\u3087\u3046\u3002\n\u6b74\u4ee3\u306e\u4f5c\u54c1\u3068\u6bd4\u3079\u308b\u3068\u304b\u306a\u308a\u30b7\u30ea\u30a2\u30b9\u5bc4\u308a\u306a\u6c17\u304c\u3057\u307e\u3059\u304c\u3001\u4e2d\u8eab\u306e\u30a8\u30ed\u3055\u306f\u5b89\u5b9a\u30fb\u5b89\u5fc3\u304b\u3064\u30d1\u30ef\u30fc\u30a2\u30c3\u30d7\u3057\u3066\u3044\u3066\u3068\u3066\u3082\u6e80\u8db3\u3067\u3059\u3002\n\u5c11\u3057\u304a\u5024\u6bb5\u304c\u9ad8\u3044\u3068\u611f\u3058\u308b\u65b9\u3082\u3044\u3089\u3063\u3057\u3083\u308b\u3067\u3057\u3087\u3046\u304c\u3001\u30d7\u30ec\u30a4\u3059\u308c\u3070\u305d\u306e\u30e2\u30e4\u30e2\u30e4\u3082\u7121\u304f\u306a\u308b\u4e8b\u9593\u9055\u3044\u306a\u3057\u3067\u3001\u6587\u53e5\u306a\u304f\u30aa\u30b9\u30b9\u30e1\u3066\u3059\u3002",
            "entry_date": "2025-01-25 02:04:01",
            "regist_date": "2025-01-25 04:05:15",
            "good_review": "82",
            "bad_review": "0",
            "circle_id": "RG25631",
            "nick_name": "\u30ca\u30ca@\u30aa\u30fc\u30eb\u30c9\u30ea\u30fc\u30d5",
            "popularity": "39",
            "rate": "4",
            "circle_name": "\u3042\u305b\u308d\u3089",
            "top_sort_key": "1",
            "reviewer_status": "active",
            "is_purchased": "1",
            "rate_num": "40",
            "reviewer_rank": "39\u4f4d",
            "longtext": false,
            "genre": {
              "016": "\u30d5\u30a1\u30f3\u30bf\u30b8\u30fc"
            }
          },
        ]
        // try {
        //   const response = await fetch('http://a/review_list');
        //   if (!response.ok) {
        //     throw new Error('データの取得に失敗しました');
        //   }
        //   this.reviews = await response.json();
        // } catch (error) {
        //   console.error("レビューの取得に失敗しました:", error);
        // }
      },
      formatDate(dateString) {
        const date = new Date(dateString);
        if (isNaN(date)) return dateString;
        return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, "0")}月${String(date.getDate()).padStart(2, "0")}日`;
      },
      async submitReviewReferenceMessage(review_id, product_id) {
        try {
          const url = `https://www.dlsite.com/maniax/mypage/review/ajax?act=good_review&review_id=${review_id}&product_id=${product_id}`;
          const response = await fetch(url, {
            method: "POST",
          });
      
          if (!response.ok) {
            throw new Error(`投票に失敗しました: ${response.statusText}`);
          }
      
          const result = await response.json();
          this.$set(this.review_reference_messages, review_id, result.text);
        } catch (error) {
          console.error("投票に失敗しました:", error);
          this.$set(this.review_reference_messages, review_id, "投票に失敗しました。Enspellを無効にしてお試しください。");
        }
      },
      revealSpoiler(review_id) {
        this.$set(this.spoilerVisible, review_id, true);
      },
      getReviewerRankClass(rank) {
        if (!rank) return '';
        if (rank.startsWith("Best")) {
          return "icon_rank type_blonze";
        }
        const match = rank.match(/^(\d+)位$/);
        if (match) {
          const position = parseInt(match[1], 10);
          if (position >= 1 && position <= 10) {
            return "icon_rank type_gold";
          } else if (position >= 11 && position <= 50) {
            return "icon_rank type_silver";
          }
        }
        return "icon_rank type_blonze";
      }

    }
};
