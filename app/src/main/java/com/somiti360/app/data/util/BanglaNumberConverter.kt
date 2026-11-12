package com.somiti360.app.data.util

import kotlin.math.abs

object BanglaNumberConverter {

    private val banglaDigits = mapOf(
        '0' to '০', '1' to '১', '2' to '২', '3' to '৩', '4' to '৪',
        '5' to '৫', '6' to '৬', '7' to '৭', '8' to '৮', '9' to '৯'
    )

    fun toBanglaDigits(input: Any?): String {
        if (input == null) return "০"
        val str = input.toString()
        val sb = java.lang.StringBuilder()
        for (ch in str) {
            sb.append(banglaDigits[ch] ?: ch)
        }
        return sb.toString()
    }

    fun formatCurrency(amount: Double, isBangla: Boolean = true): String {
        val formatted = String.format(java.util.Locale.US, "%,.0f", amount)
        return if (isBangla) "৳ " + toBanglaDigits(formatted) else "BDT $formatted"
    }

    private val units = arrayOf(
        "", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়", "দশ",
        "এগারো", "বারো", "তেরো", "চৌদ্দ", "পনেরো", "ষোলো", "সতেরো", "আঠারো", "উনিশ", "বিশ",
        "একুশ", "বাইশ", "তেইশ", "চব্বিশ", "পঁচিশ", "ছাব্বিশ", "সাতাশ", "আঠাশ", "ঊনত্রিশ", "ত্রিশ",
        "একত্রিশ", "বত্রিশ", "তেত্রিশ", "চৌত্রিশ", "পঁয়ত্রিশ", "ছত্রিশ", "সাঁইত্রিশ", "আটত্রিশ", "ঊনচল্লিশ", "চল্লিশ",
        "একচল্লিশ", "বিয়াল্লিশ", "তেতাল্লিশ", "চুয়াল্লিশ", "পঁয়তাল্লিশ", "ছেচল্লিশ", "সাতচল্লিশ", "আটচল্লিশ", "ঊনপঞ্চাশ", "পঞ্চাশ",
        "একান্ন", "বায়ান্ন", "তিপ্পান্ন", "চুয়ান্ন", "পঞ্চান্ন", "ছাপ্পান্ন", "সাতান্ন", "আটান্ন", "ঊনষাট", "ষাট",
        "একষট্টি", "বাষট্টি", "তেষট্টি", "চৌষট্টি", "পঁয়ষট্টি", "ছেষট্টি", "সাতষট্টি", "আটষট্টি", "ঊনসত্তর", "সত্তর",
        "একাত্তর", "বাহাত্তর", "তিয়াত্তর", "চুয়াত্তর", "পঁচাত্তর", "ছিয়াত্তর", "সাতাত্তর", "আটাত্তর", "ঊনআশি", "আশি",
        "একাশি", "বিরাশি", "তিরাশি", "চুরাশি", "পঁচাশি", "ছিয়াশি", "সাতাশি", "অষ্টআশি", "ঊননব্বই", "নব্বই",
        "একানব্বই", "বিরানব্বই", "তিরানব্বই", "চুরানব্বই", "পঁচানব্বই", "ছিয়ানব্বই", "সাতানব্বই", "আটানব্বই", "নিরানব্বই"
    )

    fun numberToBanglaWords(num: Double): String {
        val n = abs(num).toLong()
        if (n == 0L) return "শূন্য টাকা মাত্র"

        var words = ""
        val crore = n / 10000000L
        var rem = n % 10000000L
        val lakh = rem / 100000L
        rem %= 100000L
        val thousand = rem / 1000L
        rem %= 1000L
        val hundred = rem / 100L
        val lastTwo = (rem % 100L).toInt()

        if (crore > 0) {
            val croreStr = if (crore < units.size) units[crore.toInt()] else crore.toString()
            words += "$croreStr কোটি "
        }
        if (lakh > 0) {
            val lakhStr = if (lakh < units.size) units[lakh.toInt()] else lakh.toString()
            words += "$lakhStr লাখ "
        }
        if (thousand > 0) {
            val thousandStr = if (thousand < units.size) units[thousand.toInt()] else thousand.toString()
            words += "$thousandStr হাজার "
        }
        if (hundred > 0) {
            val hundredStr = if (hundred < units.size) units[hundred.toInt()] else hundred.toString()
            words += "$hundredStr শত "
        }
        if (lastTwo > 0) {
            words += "${units[lastTwo]} "
        }

        return "${words.trim()} টাকা মাত্র"
    }

    private val engA = arrayOf(
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    )
    private val engB = arrayOf("", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety")

    fun numberToEnglishWords(num: Double): String {
        val n = abs(num).toLong()
        if (n == 0L) return "Zero Taka Only"

        fun convertLessThanThousand(number: Int): String {
            var current: String
            if (number % 100 < 20) {
                current = engA[number % 100]
                var numDiv100 = number / 100
                if (numDiv100 > 0) {
                    current = "${engA[numDiv100]} Hundred" + (if (current.isNotEmpty()) " and $current" else "")
                }
            } else {
                current = engB[(number % 100) / 10]
                val unit = engA[number % 10]
                if (unit.isNotEmpty()) {
                    current = "$current $unit"
                }
                val numDiv100 = number / 100
                if (numDiv100 > 0) {
                    current = "${engA[numDiv100]} Hundred" + (if (current.isNotEmpty()) " and $current" else "")
                }
            }
            return current.trim()
        }

        val crore = n / 10000000L
        var rem = n % 10000000L
        val lakh = rem / 100000L
        rem %= 100000L
        val thousand = rem / 1000L
        val remainder = (rem % 1000L).toInt()

        val sb = java.lang.StringBuilder()
        if (crore > 0) {
            sb.append("${convertLessThanThousand(crore.toInt())} Crore ")
        }
        if (lakh > 0) {
            sb.append("${convertLessThanThousand(lakh.toInt())} Lakh ")
        }
        if (thousand > 0) {
            sb.append("${convertLessThanThousand(thousand.toInt())} Thousand ")
        }
        if (remainder > 0) {
            sb.append(convertLessThanThousand(remainder))
        }

        return "${sb.toString().trim()} Taka Only"
    }
}
