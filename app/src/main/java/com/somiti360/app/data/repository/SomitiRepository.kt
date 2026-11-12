package com.somiti360.app.data.repository

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.google.firebase.Firebase
import com.google.firebase.auth.auth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.somiti360.app.R
import com.somiti360.app.data.model.Deposit
import com.somiti360.app.data.model.Expense
import com.somiti360.app.data.model.Member
import com.somiti360.app.data.model.SamityLanguage
import com.somiti360.app.data.model.SamityMetrics
import com.somiti360.app.data.model.SamityProfile
import com.somiti360.app.data.model.getCurrentDateString
import com.somiti360.app.data.model.getCurrentMonthName
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

class SomitiRepository(private val context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences("somiti_360_prefs", Context.MODE_PRIVATE)

    private val _profile = MutableStateFlow(SamityProfile())
    val profile: StateFlow<SamityProfile> = _profile.asStateFlow()

    private val _members = MutableStateFlow<List<Member>>(emptyList())
    val members: StateFlow<List<Member>> = _members.asStateFlow()

    private val _deposits = MutableStateFlow<List<Deposit>>(emptyList())
    val deposits: StateFlow<List<Deposit>> = _deposits.asStateFlow()

    private val _expenses = MutableStateFlow<List<Expense>>(emptyList())
    val expenses: StateFlow<List<Expense>> = _expenses.asStateFlow()

    private val _language = MutableStateFlow(SamityLanguage.BN)
    val language: StateFlow<SamityLanguage> = _language.asStateFlow()

    private val _isDarkMode = MutableStateFlow(true)
    val isDarkMode: StateFlow<Boolean> = _isDarkMode.asStateFlow()

    private val _isCloudConnected = MutableStateFlow(false)
    val isCloudConnected: StateFlow<Boolean> = _isCloudConnected.asStateFlow()

    // Firestore instance with custom named database ID from firebase_applet_config.xml
    private val firestore: FirebaseFirestore by lazy {
        val dbId = try {
            context.getString(R.string.firestore_database_id)
        } catch (_: Exception) {
            null
        }
        if (!dbId.isNullOrBlank()) {
            FirebaseFirestore.getInstance(dbId)
        } else {
            FirebaseFirestore.getInstance()
        }
    }

    private var membersListener: ListenerRegistration? = null
    private var depositsListener: ListenerRegistration? = null
    private var expensesListener: ListenerRegistration? = null
    private var profileListener: ListenerRegistration? = null

    init {
        loadLocalData()
        startRealtimeSync()
    }

    fun toggleLanguage() {
        val next = if (_language.value == SamityLanguage.BN) SamityLanguage.EN else SamityLanguage.BN
        _language.value = next
        prefs.edit().putString("pref_lang", next.name).apply()
    }

    fun toggleTheme() {
        val next = !_isDarkMode.value
        _isDarkMode.value = next
        prefs.edit().putBoolean("pref_dark_mode", next).apply()
    }

    fun startRealtimeSync() {
        val user = Firebase.auth.currentUser
        if (user == null) {
            _isCloudConnected.value = false
            return
        }

        _isCloudConnected.value = true

        // 1. Real-time Members Listener
        membersListener?.remove()
        membersListener = firestore.collection("members")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.w("FirestoreSync", "Members listener error: ${error.message}")
                    return@addSnapshotListener
                }
                if (snapshot != null && !snapshot.isEmpty) {
                    val list = mutableListOf<Member>()
                    for (doc in snapshot.documents) {
                        val d = doc.data ?: continue
                        list.add(
                            Member(
                                id = doc.id,
                                memberCode = d["memberCode"] as? String ?: "MEM-001",
                                nameBn = d["nameBn"] as? String ?: "",
                                nameEn = d["nameEn"] as? String ?: "",
                                phone = d["phone"] as? String ?: "",
                                email = d["email"] as? String ?: "",
                                designation = d["designation"] as? String ?: "General Member",
                                bloodGroup = d["bloodGroup"] as? String ?: "O+",
                                monthlySubscriptionAmount = (d["monthlySubscriptionAmount"] as? Number)?.toDouble() ?: 1000.0,
                                joiningDate = d["joiningDate"] as? String ?: "2023-01-01",
                                status = d["status"] as? String ?: "Active",
                                nidNumber = d["nidNumber"] as? String ?: "",
                                fatherOrSpouseName = d["fatherOrSpouseName"] as? String ?: "",
                                address = d["address"] as? String ?: ""
                            )
                        )
                    }
                    if (list.isNotEmpty()) {
                        _members.value = list
                        saveLocalMembers(list)
                    }
                }
            }

        // 2. Real-time Deposits Listener (When any app adds a transaction, it updates instantly!)
        depositsListener?.remove()
        depositsListener = firestore.collection("deposits")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.w("FirestoreSync", "Deposits listener error: ${error.message}")
                    return@addSnapshotListener
                }
                if (snapshot != null && !snapshot.isEmpty) {
                    val list = mutableListOf<Deposit>()
                    for (doc in snapshot.documents) {
                        val d = doc.data ?: continue
                        list.add(
                            Deposit(
                                id = doc.id,
                                receiptNo = d["receiptNo"] as? String ?: "RCPT-001",
                                memberId = d["memberId"] as? String ?: "",
                                memberName = d["memberName"] as? String ?: "",
                                memberCode = d["memberCode"] as? String ?: "",
                                amount = (d["amount"] as? Number)?.toDouble() ?: 0.0,
                                month = d["month"] as? String ?: "",
                                date = d["date"] as? String ?: getCurrentDateString(),
                                paymentMethod = d["paymentMethod"] as? String ?: "Cash",
                                transactionRef = d["transactionRef"] as? String ?: "",
                                notes = d["notes"] as? String ?: "",
                                status = d["status"] as? String ?: "Approved",
                                verifiedCode = d["verifiedCode"] as? String ?: "S360-123456"
                            )
                        )
                    }
                    if (list.isNotEmpty()) {
                        // Sort latest first
                        val sorted = list.sortedByDescending { it.date }
                        _deposits.value = sorted
                        saveLocalDeposits(sorted)
                    }
                }
            }

        // 3. Real-time Expenses Listener
        expensesListener?.remove()
        expensesListener = firestore.collection("expenses")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.w("FirestoreSync", "Expenses listener error: ${error.message}")
                    return@addSnapshotListener
                }
                if (snapshot != null && !snapshot.isEmpty) {
                    val list = mutableListOf<Expense>()
                    for (doc in snapshot.documents) {
                        val d = doc.data ?: continue
                        list.add(
                            Expense(
                                id = doc.id,
                                voucherNo = d["voucherNo"] as? String ?: "EXP-001",
                                title = d["title"] as? String ?: "",
                                category = d["category"] as? String ?: "Office Rent",
                                amount = (d["amount"] as? Number)?.toDouble() ?: 0.0,
                                date = d["date"] as? String ?: getCurrentDateString(),
                                paymentMethod = d["paymentMethod"] as? String ?: "Cash",
                                payeeName = d["payeeName"] as? String ?: "",
                                approvedBy = d["approvedBy"] as? String ?: "",
                                remarks = d["remarks"] as? String ?: ""
                            )
                        )
                    }
                    if (list.isNotEmpty()) {
                        val sorted = list.sortedByDescending { it.date }
                        _expenses.value = sorted
                        saveLocalExpenses(sorted)
                    }
                }
            }

        // 4. Real-time Samity Profile Listener
        profileListener?.remove()
        profileListener = firestore.collection("samity_profile").document("default")
            .addSnapshotListener { snapshot, error ->
                if (error != null) return@addSnapshotListener
                val d = snapshot?.data
                if (d != null) {
                    val p = SamityProfile(
                        nameBn = d["nameBn"] as? String ?: _profile.value.nameBn,
                        nameEn = d["nameEn"] as? String ?: _profile.value.nameEn,
                        regNumber = d["regNumber"] as? String ?: _profile.value.regNumber,
                        sloganBn = d["sloganBn"] as? String ?: _profile.value.sloganBn,
                        sloganEn = d["sloganEn"] as? String ?: _profile.value.sloganEn,
                        addressBn = d["addressBn"] as? String ?: _profile.value.addressBn,
                        addressEn = d["addressEn"] as? String ?: _profile.value.addressEn,
                        phone = d["phone"] as? String ?: _profile.value.phone,
                        email = d["email"] as? String ?: _profile.value.email,
                        bankName = d["bankName"] as? String ?: _profile.value.bankName,
                        bankAccountNo = d["bankAccountNo"] as? String ?: _profile.value.bankAccountNo,
                        mobileBankingNumber = d["mobileBankingNumber"] as? String ?: _profile.value.mobileBankingNumber,
                        defaultMonthlyFee = (d["defaultMonthlyFee"] as? Number)?.toDouble() ?: _profile.value.defaultMonthlyFee
                    )
                    _profile.value = p
                }
            }
    }

    fun stopRealtimeSync() {
        membersListener?.remove()
        depositsListener?.remove()
        expensesListener?.remove()
        profileListener?.remove()
        _isCloudConnected.value = false
    }

    // CRUD Members with Firestore Cloud Sync
    fun addMember(member: Member) {
        val updated = _members.value.toMutableList().apply { add(0, member) }
        _members.value = updated
        saveLocalMembers(updated)

        // Write to Firestore if authenticated
        if (Firebase.auth.currentUser != null) {
            val map = mapOf(
                "id" to member.id,
                "memberCode" to member.memberCode,
                "nameBn" to member.nameBn,
                "nameEn" to member.nameEn,
                "phone" to member.phone,
                "email" to member.email,
                "designation" to member.designation,
                "bloodGroup" to member.bloodGroup,
                "monthlySubscriptionAmount" to member.monthlySubscriptionAmount,
                "joiningDate" to member.joiningDate,
                "status" to member.status,
                "nidNumber" to member.nidNumber,
                "address" to member.address,
                "updatedAt" to getCurrentDateString()
            )
            firestore.collection("members").document(member.id).set(map)
        }
    }

    fun updateMember(member: Member) {
        val updated = _members.value.map { if (it.id == member.id) member else it }
        _members.value = updated
        saveLocalMembers(updated)

        if (Firebase.auth.currentUser != null) {
            val map = mapOf(
                "memberCode" to member.memberCode,
                "nameBn" to member.nameBn,
                "nameEn" to member.nameEn,
                "phone" to member.phone,
                "designation" to member.designation,
                "monthlySubscriptionAmount" to member.monthlySubscriptionAmount,
                "status" to member.status,
                "address" to member.address
            )
            firestore.collection("members").document(member.id).update(map)
        }
    }

    fun deleteMember(memberId: String) {
        val updated = _members.value.filterNot { it.id == memberId }
        _members.value = updated
        saveLocalMembers(updated)

        if (Firebase.auth.currentUser != null) {
            firestore.collection("members").document(memberId).delete()
        }
    }

    // CRUD Deposits with Firestore Real-time Broadcast
    fun addDeposit(deposit: Deposit) {
        val updated = _deposits.value.toMutableList().apply { add(0, deposit) }
        _deposits.value = updated
        saveLocalDeposits(updated)

        if (Firebase.auth.currentUser != null) {
            val map = mapOf(
                "id" to deposit.id,
                "receiptNo" to deposit.receiptNo,
                "memberId" to deposit.memberId,
                "memberName" to deposit.memberName,
                "memberCode" to deposit.memberCode,
                "amount" to deposit.amount,
                "month" to deposit.month,
                "date" to deposit.date,
                "paymentMethod" to deposit.paymentMethod,
                "transactionRef" to deposit.transactionRef,
                "notes" to deposit.notes,
                "status" to deposit.status,
                "verifiedCode" to deposit.verifiedCode,
                "createdAt" to getCurrentDateString()
            )
            firestore.collection("deposits").document(deposit.id).set(map)
        }
    }

    fun deleteDeposit(depositId: String) {
        val updated = _deposits.value.filterNot { it.id == depositId }
        _deposits.value = updated
        saveLocalDeposits(updated)

        if (Firebase.auth.currentUser != null) {
            firestore.collection("deposits").document(depositId).delete()
        }
    }

    // CRUD Expenses with Firestore Cloud Sync
    fun addExpense(expense: Expense) {
        val updated = _expenses.value.toMutableList().apply { add(0, expense) }
        _expenses.value = updated
        saveLocalExpenses(updated)

        if (Firebase.auth.currentUser != null) {
            val map = mapOf(
                "id" to expense.id,
                "voucherNo" to expense.voucherNo,
                "title" to expense.title,
                "category" to expense.category,
                "amount" to expense.amount,
                "date" to expense.date,
                "paymentMethod" to expense.paymentMethod,
                "payeeName" to expense.payeeName,
                "approvedBy" to expense.approvedBy,
                "remarks" to expense.remarks,
                "createdAt" to getCurrentDateString()
            )
            firestore.collection("expenses").document(expense.id).set(map)
        }
    }

    fun deleteExpense(expenseId: String) {
        val updated = _expenses.value.filterNot { it.id == expenseId }
        _expenses.value = updated
        saveLocalExpenses(updated)

        if (Firebase.auth.currentUser != null) {
            firestore.collection("expenses").document(expenseId).delete()
        }
    }

    fun updateProfile(newProfile: SamityProfile) {
        _profile.value = newProfile
        val obj = JSONObject().apply {
            put("nameBn", newProfile.nameBn)
            put("nameEn", newProfile.nameEn)
            put("regNumber", newProfile.regNumber)
            put("sloganBn", newProfile.sloganBn)
            put("sloganEn", newProfile.sloganEn)
            put("addressBn", newProfile.addressBn)
            put("addressEn", newProfile.addressEn)
            put("phone", newProfile.phone)
            put("email", newProfile.email)
            put("bankName", newProfile.bankName)
            put("bankAccountNo", newProfile.bankAccountNo)
            put("mobileBankingNumber", newProfile.mobileBankingNumber)
            put("defaultMonthlyFee", newProfile.defaultMonthlyFee)
        }
        prefs.edit().putString("saved_profile", obj.toString()).apply()

        if (Firebase.auth.currentUser != null) {
            val map = mapOf(
                "nameBn" to newProfile.nameBn,
                "nameEn" to newProfile.nameEn,
                "regNumber" to newProfile.regNumber,
                "sloganBn" to newProfile.sloganBn,
                "sloganEn" to newProfile.sloganEn,
                "addressBn" to newProfile.addressBn,
                "addressEn" to newProfile.addressEn,
                "phone" to newProfile.phone,
                "email" to newProfile.email,
                "bankName" to newProfile.bankName,
                "bankAccountNo" to newProfile.bankAccountNo,
                "mobileBankingNumber" to newProfile.mobileBankingNumber,
                "defaultMonthlyFee" to newProfile.defaultMonthlyFee
            )
            firestore.collection("samity_profile").document("default").set(map)
        }
    }

    // Google Drive & Cloud Backup JSON Generator
    fun generateFullBackupJson(): String {
        val root = JSONObject()
        root.put("version", "2.0.0")
        root.put("exportedAt", getCurrentDateString())
        root.put("samityName", _profile.value.nameBn)
        root.put("registrationNo", _profile.value.regNumber)

        val membersArr = JSONArray()
        _members.value.forEach { m ->
            membersArr.put(JSONObject().apply {
                put("id", m.id)
                put("code", m.memberCode)
                put("nameBn", m.nameBn)
                put("nameEn", m.nameEn)
                put("phone", m.phone)
                put("designation", m.designation)
                put("monthlyFee", m.monthlySubscriptionAmount)
                put("status", m.status)
            })
        }
        root.put("members", membersArr)

        val depositsArr = JSONArray()
        _deposits.value.forEach { d ->
            depositsArr.put(JSONObject().apply {
                put("id", d.id)
                put("receiptNo", d.receiptNo)
                put("member", d.memberName)
                put("code", d.memberCode)
                put("amount", d.amount)
                put("month", d.month)
                put("date", d.date)
                put("method", d.paymentMethod)
                put("verifiedCode", d.verifiedCode)
            })
        }
        root.put("deposits", depositsArr)

        val expensesArr = JSONArray()
        _expenses.value.forEach { e ->
            expensesArr.put(JSONObject().apply {
                put("id", e.id)
                put("voucherNo", e.voucherNo)
                put("title", e.title)
                put("category", e.category)
                put("amount", e.amount)
                put("date", e.date)
            })
        }
        root.put("expenses", expensesArr)

        // Save a copy to Firestore under cloud_backups if authenticated
        if (Firebase.auth.currentUser != null) {
            val backupId = "backup_" + System.currentTimeMillis()
            val backupMap = mapOf(
                "id" to backupId,
                "backupName" to "Backup_${_profile.value.nameEn}_${getCurrentDateString()}",
                "timestamp" to getCurrentDateString(),
                "dataJson" to root.toString(),
                "createdBy" to (Firebase.auth.currentUser?.email ?: "admin")
            )
            firestore.collection("cloud_backups").document(backupId).set(backupMap)
        }

        return root.toString(2)
    }

    fun getMetrics(): SamityMetrics {
        val memberList = _members.value
        val depositList = _deposits.value
        val expenseList = _expenses.value

        val totalMembers = memberList.size
        val activeMembers = memberList.count { it.status == "Active" }
        val totalCollections = depositList.filter { it.status == "Approved" }.sumOf { it.amount }
        val currentMonthName = getCurrentMonthName(true)
        val currentMonthCollections = depositList
            .filter { it.status == "Approved" && (it.month.contains(currentMonthName) || it.date.startsWith("2026-11")) }
            .sumOf { it.amount }
        val totalExpenses = expenseList.sumOf { it.amount }
        val netReserveFund = totalCollections - totalExpenses

        val monthlyExpectedTotal = memberList.filter { it.status == "Active" }.sumOf { it.monthlySubscriptionAmount }
        val currentMonthPaidMembers = depositList
            .filter { it.status == "Approved" && (it.month.contains(currentMonthName) || it.date.startsWith("2026-11")) }
            .map { it.memberId }
            .toSet()

        val defaulters = memberList.filter { it.status == "Active" && !currentMonthPaidMembers.contains(it.id) }
        val defaultersCount = defaulters.size
        val totalDuesAmount = defaulters.sumOf { it.monthlySubscriptionAmount }

        val collectionRate = if (monthlyExpectedTotal > 0) {
            ((currentMonthCollections / monthlyExpectedTotal) * 100).toInt().coerceIn(0, 100)
        } else 100

        return SamityMetrics(
            totalMembers = totalMembers,
            activeMembers = activeMembers,
            totalCollections = totalCollections,
            currentMonthCollections = currentMonthCollections,
            totalExpenses = totalExpenses,
            netReserveFund = netReserveFund,
            monthlyExpectedTotal = monthlyExpectedTotal,
            totalDuesAmount = totalDuesAmount,
            defaultersCount = defaultersCount,
            collectionRatePercent = collectionRate
        )
    }

    fun findDocumentByCode(codeQuery: String): Deposit? {
        val clean = codeQuery.trim().uppercase()
        return _deposits.value.firstOrNull {
            it.receiptNo.uppercase() == clean ||
            it.verifiedCode.uppercase() == clean ||
            it.transactionRef.uppercase() == clean ||
            it.receiptNo.contains(clean, ignoreCase = true) ||
            it.verifiedCode.contains(clean, ignoreCase = true)
        }
    }

    private fun loadLocalData() {
        val langStr = prefs.getString("pref_lang", "BN") ?: "BN"
        _language.value = if (langStr == "EN") SamityLanguage.EN else SamityLanguage.BN
        _isDarkMode.value = prefs.getBoolean("pref_dark_mode", true)

        val membersJson = prefs.getString("saved_members", null)
        if (membersJson.isNullOrBlank()) {
            val initialMembers = createInitialMembers()
            _members.value = initialMembers
            saveLocalMembers(initialMembers)
        } else {
            _members.value = parseMembers(membersJson)
        }

        val depositsJson = prefs.getString("saved_deposits", null)
        if (depositsJson.isNullOrBlank()) {
            val initialDeposits = createInitialDeposits(_members.value)
            _deposits.value = initialDeposits
            saveLocalDeposits(initialDeposits)
        } else {
            _deposits.value = parseDeposits(depositsJson)
        }

        val expensesJson = prefs.getString("saved_expenses", null)
        if (expensesJson.isNullOrBlank()) {
            val initialExpenses = createInitialExpenses()
            _expenses.value = initialExpenses
            saveLocalExpenses(initialExpenses)
        } else {
            _expenses.value = parseExpenses(expensesJson)
        }
    }

    private fun saveLocalMembers(list: List<Member>) {
        val arr = JSONArray()
        list.forEach { m ->
            val obj = JSONObject().apply {
                put("id", m.id)
                put("memberCode", m.memberCode)
                put("nameBn", m.nameBn)
                put("nameEn", m.nameEn)
                put("phone", m.phone)
                put("email", m.email)
                put("designation", m.designation)
                put("bloodGroup", m.bloodGroup)
                put("monthlySubscriptionAmount", m.monthlySubscriptionAmount)
                put("joiningDate", m.joiningDate)
                put("status", m.status)
                put("nidNumber", m.nidNumber)
                put("fatherOrSpouseName", m.fatherOrSpouseName)
                put("address", m.address)
            }
            arr.put(obj)
        }
        prefs.edit().putString("saved_members", arr.toString()).apply()
    }

    private fun parseMembers(json: String): List<Member> {
        val result = mutableListOf<Member>()
        try {
            val arr = JSONArray(json)
            for (i in 0 until arr.length()) {
                val obj = arr.getJSONObject(i)
                result.add(
                    Member(
                        id = obj.optString("id", UUID.randomUUID().toString()),
                        memberCode = obj.optString("memberCode", "MEM-${i + 1}"),
                        nameBn = obj.optString("nameBn", ""),
                        nameEn = obj.optString("nameEn", ""),
                        phone = obj.optString("phone", ""),
                        email = obj.optString("email", ""),
                        designation = obj.optString("designation", "General Member"),
                        bloodGroup = obj.optString("bloodGroup", "O+"),
                        monthlySubscriptionAmount = obj.optDouble("monthlySubscriptionAmount", 1000.0),
                        joiningDate = obj.optString("joiningDate", "2023-01-01"),
                        status = obj.optString("status", "Active"),
                        nidNumber = obj.optString("nidNumber", ""),
                        fatherOrSpouseName = obj.optString("fatherOrSpouseName", ""),
                        address = obj.optString("address", "")
                    )
                )
            }
        } catch (_: Exception) {}
        return result
    }

    private fun saveLocalDeposits(list: List<Deposit>) {
        val arr = JSONArray()
        list.forEach { d ->
            val obj = JSONObject().apply {
                put("id", d.id)
                put("receiptNo", d.receiptNo)
                put("memberId", d.memberId)
                put("memberName", d.memberName)
                put("memberCode", d.memberCode)
                put("amount", d.amount)
                put("month", d.month)
                put("date", d.date)
                put("paymentMethod", d.paymentMethod)
                put("transactionRef", d.transactionRef)
                put("notes", d.notes)
                put("status", d.status)
                put("verifiedCode", d.verifiedCode)
            }
            arr.put(obj)
        }
        prefs.edit().putString("saved_deposits", arr.toString()).apply()
    }

    private fun parseDeposits(json: String): List<Deposit> {
        val result = mutableListOf<Deposit>()
        try {
            val arr = JSONArray(json)
            for (i in 0 until arr.length()) {
                val obj = arr.getJSONObject(i)
                result.add(
                    Deposit(
                        id = obj.optString("id", UUID.randomUUID().toString()),
                        receiptNo = obj.optString("receiptNo", "RCPT-001"),
                        memberId = obj.optString("memberId", ""),
                        memberName = obj.optString("memberName", ""),
                        memberCode = obj.optString("memberCode", ""),
                        amount = obj.optDouble("amount", 1000.0),
                        month = obj.optString("month", "নভেম্বর ২০২৬"),
                        date = obj.optString("date", getCurrentDateString()),
                        paymentMethod = obj.optString("paymentMethod", "Cash"),
                        transactionRef = obj.optString("transactionRef", ""),
                        notes = obj.optString("notes", ""),
                        status = obj.optString("status", "Approved"),
                        verifiedCode = obj.optString("verifiedCode", "S360-123456")
                    )
                )
            }
        } catch (_: Exception) {}
        return result
    }

    private fun saveLocalExpenses(list: List<Expense>) {
        val arr = JSONArray()
        list.forEach { e ->
            val obj = JSONObject().apply {
                put("id", e.id)
                put("voucherNo", e.voucherNo)
                put("title", e.title)
                put("category", e.category)
                put("amount", e.amount)
                put("date", e.date)
                put("paymentMethod", e.paymentMethod)
                put("payeeName", e.payeeName)
                put("approvedBy", e.approvedBy)
                put("remarks", e.remarks)
            }
            arr.put(obj)
        }
        prefs.edit().putString("saved_expenses", arr.toString()).apply()
    }

    private fun parseExpenses(json: String): List<Expense> {
        val result = mutableListOf<Expense>()
        try {
            val arr = JSONArray(json)
            for (i in 0 until arr.length()) {
                val obj = arr.getJSONObject(i)
                result.add(
                    Expense(
                        id = obj.optString("id", UUID.randomUUID().toString()),
                        voucherNo = obj.optString("voucherNo", "EXP-001"),
                        title = obj.optString("title", ""),
                        category = obj.optString("category", "Office Rent"),
                        amount = obj.optDouble("amount", 0.0),
                        date = obj.optString("date", getCurrentDateString()),
                        paymentMethod = obj.optString("paymentMethod", "Cash"),
                        payeeName = obj.optString("payeeName", ""),
                        approvedBy = obj.optString("approvedBy", ""),
                        remarks = obj.optString("remarks", "")
                    )
                )
            }
        } catch (_: Exception) {}
        return result
    }

    private fun createInitialMembers(): List<Member> {
        return listOf(
            Member(
                id = "mem_01",
                memberCode = "S360-001",
                nameBn = "মোঃ রফিকুল ইসলাম",
                nameEn = "Md. Rafiqul Islam",
                phone = "01711223344",
                email = "rafiqul@example.com",
                designation = "President",
                bloodGroup = "B+",
                monthlySubscriptionAmount = 1500.0,
                joiningDate = "2020-01-10",
                status = "Active",
                nidNumber = "19852691234567890",
                address = "বাড়ি #৪, রোড #১, উত্তরা, ঢাকা"
            ),
            Member(
                id = "mem_02",
                memberCode = "S360-002",
                nameBn = "মোসাম্মৎ পারভীন আক্তার",
                nameEn = "Mst. Parvin Akter",
                phone = "01819334455",
                email = "parvin@example.com",
                designation = "General Secretary",
                bloodGroup = "A+",
                monthlySubscriptionAmount = 1500.0,
                joiningDate = "2020-01-10",
                status = "Active",
                nidNumber = "19882691234567891",
                address = "সেক্টর #৪, উত্তরা, ঢাকা"
            ),
            Member(
                id = "mem_03",
                memberCode = "S360-003",
                nameBn = "এ কে এম মাহমুদুল হাসান",
                nameEn = "A K M Mahmudul Hasan",
                phone = "01912445566",
                email = "mahmud@example.com",
                designation = "Treasurer",
                bloodGroup = "O+",
                monthlySubscriptionAmount = 1200.0,
                joiningDate = "2020-02-15",
                status = "Active",
                nidNumber = "19902691234567892",
                address = "রোড #৭, মিরপুর-১১, ঢাকা"
            ),
            Member(
                id = "mem_04",
                memberCode = "S360-004",
                nameBn = "তৌহিদুল করিম স্বপন",
                nameEn = "Touhidul Karim Swapan",
                phone = "01723556677",
                email = "swapan@example.com",
                designation = "Executive Member",
                bloodGroup = "AB+",
                monthlySubscriptionAmount = 1000.0,
                joiningDate = "2021-03-01",
                status = "Active",
                nidNumber = "19922691234567893",
                address = "বনানী, ঢাকা"
            ),
            Member(
                id = "mem_05",
                memberCode = "S360-005",
                nameBn = "ফাহমিদা নাসরিন",
                nameEn = "Fahmida Nasrin",
                phone = "01611667788",
                email = "fahmida@example.com",
                designation = "General Member",
                bloodGroup = "O-",
                monthlySubscriptionAmount = 1000.0,
                joiningDate = "2021-06-12",
                status = "Active",
                nidNumber = "19952691234567894",
                address = "গুলশান-১, ঢাকা"
            )
        )
    }

    private fun createInitialDeposits(members: List<Member>): List<Deposit> {
        val currentMonth = getCurrentMonthName(true)
        val today = getCurrentDateString()
        return listOf(
            Deposit(
                id = "dep_01",
                receiptNo = "RCPT-2026-1101",
                memberId = "mem_01",
                memberName = "মোঃ রফিকুল ইসলাম",
                memberCode = "S360-001",
                amount = 1500.0,
                month = currentMonth,
                date = today,
                paymentMethod = "Bank Transfer",
                transactionRef = "IBBL-TXN-88491",
                notes = "অনলাইন ব্যাংক ট্রান্সফার",
                status = "Approved",
                verifiedCode = "S360-918274"
            ),
            Deposit(
                id = "dep_02",
                receiptNo = "RCPT-2026-1102",
                memberId = "mem_02",
                memberName = "মোসাম্মৎ পারভীন আক্তার",
                memberCode = "S360-002",
                amount = 1500.0,
                month = currentMonth,
                date = today,
                paymentMethod = "bKash",
                transactionRef = "BKASH-9KA7L2",
                notes = "বিকাশ মার্চেন্ট পেমেন্ট",
                status = "Approved",
                verifiedCode = "S360-449102"
            ),
            Deposit(
                id = "dep_03",
                receiptNo = "RCPT-2026-1103",
                memberId = "mem_03",
                memberName = "এ কে এম মাহমুদুল হাসান",
                memberCode = "S360-003",
                amount = 1200.0,
                month = currentMonth,
                date = today,
                paymentMethod = "Cash",
                transactionRef = "CASH-DESK-01",
                notes = "কাউন্টার ক্যাশ রিসিভ",
                status = "Approved",
                verifiedCode = "S360-771203"
            )
        )
    }

    private fun createInitialExpenses(): List<Expense> {
        val today = getCurrentDateString()
        return listOf(
            Expense(
                id = "exp_01",
                voucherNo = "VOUCH-2026-101",
                title = "অফিস স্পেস মাসিক ভাড়া",
                category = "Office Rent",
                amount = 12000.0,
                date = today,
                paymentMethod = "Bank Transfer",
                payeeName = "বাড়িওয়ালা আলহাজ্ব নূর উদ্দিন",
                approvedBy = "সভাপতি ও সাধারণ সম্পাদক",
                remarks = "নভেম্বর ২০২৬ মাসের অফিস ভাড়া পরিশোধ"
            ),
            Expense(
                id = "exp_02",
                voucherNo = "VOUCH-2026-102",
                title = "স্টেশনারি, রসিদ বই ও প্রিন্টিং",
                category = "Stationery",
                amount = 2500.0,
                date = today,
                paymentMethod = "Cash",
                payeeName = "জনতা প্রিন্টার্স",
                approvedBy = "কোষাধ্যক্ষ",
                remarks = "নতুন ৫০০ কপি রসিদ বই ও ভাউচার প্যাড"
            )
        )
    }
}
