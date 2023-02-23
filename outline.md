# Computer Builder の要素

## HTML & CSS について

- ~~全体規定と上部の帯を作る~~
- ~~セレクト部分を作る~~
- ~~ボタンを作る~~
- ~~結果の表示部分を作る~~
- スクロールバー非表示にする？取り敢えずしない

## JavaScript について

- ~~APIを取得する処理の実装~~
- ~~HTMLの各selectのoptionを変更する処理の実装~~
- 各stepごとのoptionに関する依存関係を実装する
  - step毎にfetchしてその中でmapとか作って処理する必要はない
  - fetch外部の変数に普通にデータを保存できるので大丈夫
  - addOption及びcreateOptionは改造する必要があると思う
- ボタンの機能を実装する
  - add button
  - ~~clear button~~
- ~~結果を計算する関数の実装~~
- 結果の表示機能を実装する
  - optionのvalueにBenchmarkの値を入れる
- 取得した文字列の解析をする機能の実装
  - ~~memory how many~~
  - ~~storage capacity~~

### 次やろうとしていたこと

- resultCalculatorに値を入れる方法を考えていた
- 今のところ各fetchの中でしか値を扱えないので4つの値をすべて入力するのが難しい
