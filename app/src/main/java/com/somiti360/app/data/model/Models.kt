package com.somiti360.app.data.model

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

enum class SamityLanguage {
    BN, EN
}

data class SamityProfile(
    val id: String = "samity_headquarters",
    val nameBn: String = "স্বপ্নছোঁয়া সমবায় সমিতি লিঃ",
    val nameEn: String = "Shopnochoa Cooperative Society Ltd.",
    val regNumber: String = "রেজি নং: সম-১২০৯/২০১৮",
    val sloganBn: String = "একতা ও সততাই আমাদের শক্তি",
    val sloganEn: String = "Unity and Integrity is Our Strength",
    val addressBn: String = "প্লট #১২, রোড #০৪, সেক্টর #১১, উত্তরা, ঢাকা-১২৩০",
    val addressEn: String = "Plot #12, Road #04, Sector #11, Uttara, Dhaka-1230",
    val phone: String = "+8801712345678",
    val email: String = "contact@shopnochoa-samity.org",
    val website: String = "somiti360.vercel.app",
    val division: String = "ঢাকা",
    val bankName: String = "ইসলামী ব্যাংক বাংলাদেশ লিঃ",
    val bankAccountNo: String = "2050123456789010",
    val mobileBankingNumber: String = "01712345678 (bKash/Nagad)",
    val defaultMonthlyFee: Double = 1000.0,
    val currencySymbol: String = "৳"
)

data class Member(
    val id: String,
    val memberCode: String,
    val nameBn: String,
    val nameEn: String,
    val phone: String,
    val email: String = "",
    val designation: String = "General Member", // President, Secretary, Treasurer, Executive Member, General Member
    val bloodGroup: String = "O+",
    val monthlySubscriptionAmount: Double = 1000.0,
    val joiningDate: String = "2023-01-15",
    val status: String = "Active", // Active, Inactive, Suspended
    val nidNumber: String = "",
    val fatherOrSpouseName: String = "",
    val address: String = ""
)

data class Deposit(
    val id: String,
    val receiptNo: String,
    val memberId: String,
    val memberName: String,
    val memberCode: String,
    val amount: Double,
    val month: String, // e.g. "নভেম্বর ২০২৬" / "November 2026"
    val date: String, // YYYY-MM-DD
    val paymentMethod: String = "Cash", // Cash, Bank, bKash, Nagad, Rocket
    val transactionRef: String = "",
    val notes: String = "",
    val status: String = "Approved",
    val verifiedCode: String = "S360-" + (100000..999999).random()
)

data class Expense(
    val id: String,
    val voucherNo: String,
    val title: String,
    val category: String, // Office Rent, Salaries, Events, Stationery, Maintenance, Utilities, Other
    val amount: Double,
    val date: String,
    val paymentMethod: String = "Cash",
    val payeeName: String = "",
    val approvedBy: String = "সভাপতি ও সাধারণ সম্পাদক",
    val remarks: String = ""
)

data class SamityMetrics(
    val totalMembers: Int,
    val activeMembers: Int,
    val totalCollections: Double,
    val currentMonthCollections: Double,
    val totalExpenses: Double,
    val netReserveFund: Double,
    val monthlyExpectedTotal: Double,
    val totalDuesAmount: Double,
    val defaultersCount: Int,
    val collectionRatePercent: Int
)

fun getCurrentDateString(): String {
    val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    return sdf.format(Date())
}

fun getCurrentMonthName(isBangla: Boolean): String {
    val monthIndex = java.util.Calendar.getInstance().get(java.util.Calendar.MONTH)
    val year = java.util.Calendar.getInstance().get(java.util.Calendar.YEAR)
    val bnMonths = listOf(
        "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
        "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
    )
    val enMonths = listOf(
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    )
    return if (isBangla) "${bnMonths[monthIndex]} $year" else "${enMonths[monthIndex]} $year"
}
