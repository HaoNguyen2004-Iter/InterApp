using System;

namespace Service.Utility.Components
{
    public static class NumberComponent
    {
        private static readonly Random Ran = new Random();

        public static string FormatPrice(this decimal? value, string unit = " VNĐ")
        {
            if (value.HasValue && value.Value != 0)
            {
                if (value.Value > 0)
                {
                    return string.Format("{0:0,0}", value) + unit;
                }
                else
                {
                    return "-" + string.Format("{0:0,0}", -value) + unit;
                }
            }

            return "0" + unit;
        }

        public static string FormatPrice(this decimal value, string unit = " VNĐ")
        {
            if (value != 0)
            {
                if (value > 0)
                {
                    return string.Format("{0:0,0}", value) + unit;
                }
                else
                {
                    var v = -value;
                    return "-" + string.Format("{0:0,0}", v) + unit;
                }
            }

            return "0" + unit;
        }

        public static string VnMoney(int v, bool hasZero)
        {
            var arr = new string[] { "không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín", "mười", "lăm" };
            var str = "";
            var vs = v + "";

            int t = 0;
            var ft = false;
            var fn = false;
            if (v >= 100)
            {
                ft = true;
                t = v / 100;
                str += " " + arr[t] + " trăm";
                v = v - (t * 100);
            }
            else
            {
                if (hasZero)
                {
                    if (v * 100 != 0)
                    {
                        fn = true;
                        str += " không trăm";
                    }
                }
            }

            var fc = false;

            if (v >= 10)
            {
                fc = true;
                t = v / 10;
                if (t == 1)
                {
                    str += " mười";
                }
                else
                {
                    str += " " + arr[t] + " mươi";
                }

                v = v - (t * 10);
            }
            else
            {
                if (ft || fn)
                {
                    if (v > 0)
                    {
                        str += " lẻ";
                    }
                }
            }

            if (v > 0)
            {
                if (v == 5 && fc)
                {
                    str += " lăm";
                }
                else
                {
                    str += " " + arr[v];
                }
            }

            return str;
        }

        public static string MoneyToString(this decimal v)
        {
            var str = "";
            decimal t = 0;
            if (v == 0)
            {
                str += "không";
            }
            else
            {
                if (v >= 1000000000000)
                {
                    t = (int)(v / 1000000000000);
                    str += VnMoney((int)t, false) + " nghìn";
                    v = v - (t * 1000000000000);
                }

                if (v >= 1000000000)
                {
                    t = (int)(v / 1000000000);
                    str += VnMoney((int)t, str.Length > 0) + " tỷ";
                    v = v - (t * 1000000000);
                }

                if (v >= 1000000)
                {
                    t = (int)(v / 1000000);
                    str += VnMoney((int)t, str.Length > 0) + " triệu";
                    v = v - (t * 1000000);
                }

                if (v >= 1000)
                {
                    t = (int)(v / 1000);
                    str += VnMoney((int)t, str.Length > 0) + " nghìn";
                    v = v - (t * 1000);
                }
                str += VnMoney((int)v, str.Length > 0);
            }
            return str + " đồng";
        }

        public static decimal ToDecimal(this string str)
        {
            if (!str.HasValue())
                return 0;

            decimal v;
            if (decimal.TryParse(str, out v))
            {
                return v;
            }
            return 0;
        }

        public static int ToInt(this string str)
        {
            if (!str.HasValue())
                return 0;

            int v;
            if (Int32.TryParse(str, out v))
            {
                return v;
            }
            return 0;
        }

        public static double ToDouble(this string str)
        {
            if (!str.HasValue())
                return 0;

            double v;
            if (double.TryParse(str, out v))
            {
                return v;
            }
            return 0;
        }

        public static decimal RoundNumber(this decimal v, int l)
        {
            var h = l / 2;
            decimal result = v % l >= h ? v + l - v % l : v - v % l;
            return result;
        }
    }
}