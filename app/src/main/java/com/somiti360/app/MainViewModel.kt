package com.somiti360.app

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import com.somiti360.app.data.model.Deposit
import com.somiti360.app.data.model.Expense
import com.somiti360.app.data.model.Member
import com.somiti360.app.data.model.SamityLanguage
import com.somiti360.app.data.model.SamityMetrics
import com.somiti360.app.data.model.SamityProfile
import com.somiti360.app.data.model.getCurrentDateString
import com.somiti360.app.data.model.getCurrentMonthName
import com.somiti360.app.data.repository.SomitiRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = SomitiRepository(application)

    val profile: StateFlow<SamityProfile> = repository.profile
    val members: StateFlow<List<Member>> = repository.members
    val deposits: StateFlow<List<Deposit>> = repository.deposits
    val expenses: StateFlow<List<Expense>> = repository.expenses
    val language: StateFlow<SamityLanguage> = repository.language
    val isDarkMode: StateFlow<Boolean> = repository.isDarkMode
    val isCloudConnected: StateFlow<Boolean> = repository.isCloudConnected

    fun startRealtimeSync() = repository.startRealtimeSync()
    fun stopRealtimeSync() = repository.stopRealtimeSync()

    fun exportToGoogleDrive(context: android.content.Context) {
        val json = repository.generateFullBackupJson()
        com.somiti360.app.ui.auth.GoogleAuthHelper.shareBackupToGoogleDrive(context, json)
    }

    private val _selectedTab = MutableStateFlow(0)
    val selectedTab: StateFlow<Int> = _selectedTab.asStateFlow()

    // Dialog & Navigation modals
    private val _showAddMemberDialog = MutableStateFlow(false)
    val showAddMemberDialog: StateFlow<Boolean> = _showAddMemberDialog.asStateFlow()

    private val _selectedMemberForDetail = MutableStateFlow<Member?>(null)
    val selectedMemberForDetail: StateFlow<Member?> = _selectedMemberForDetail.asStateFlow()

    private val _showAddDepositDialog = MutableStateFlow(false)
    val showAddDepositDialog: StateFlow<Boolean> = _showAddDepositDialog.asStateFlow()

    private val _preselectedMemberForDeposit = MutableStateFlow<Member?>(null)
    val preselectedMemberForDeposit: StateFlow<Member?> = _preselectedMemberForDeposit.asStateFlow()

    private val _showAddExpenseDialog = MutableStateFlow(false)
    val showAddExpenseDialog: StateFlow<Boolean> = _showAddExpenseDialog.asStateFlow()

    private val _selectedDepositForReceipt = MutableStateFlow<Deposit?>(null)
    val selectedDepositForReceipt: StateFlow<Deposit?> = _selectedDepositForReceipt.asStateFlow()

    private val _showQrVerificationDialog = MutableStateFlow(false)
    val showQrVerificationDialog: StateFlow<Boolean> = _showQrVerificationDialog.asStateFlow()

    private val _showSettingsDialog = MutableStateFlow(false)
    val showSettingsDialog: StateFlow<Boolean> = _showSettingsDialog.asStateFlow()

    fun selectTab(index: Int) {
        _selectedTab.value = index
    }

    fun toggleLanguage() = repository.toggleLanguage()

    fun toggleTheme() = repository.toggleTheme()

    fun getMetrics(): SamityMetrics = repository.getMetrics()

    // Member dialog control
    fun openAddMemberDialog() {
        _showAddMemberDialog.value = true
    }

    fun closeAddMemberDialog() {
        _showAddMemberDialog.value = false
    }

    fun openMemberDetail(member: Member) {
        _selectedMemberForDetail.value = member
    }

    fun closeMemberDetail() {
        _selectedMemberForDetail.value = null
    }

    // Deposit dialog control
    fun openAddDepositDialog(member: Member? = null) {
        _preselectedMemberForDeposit.value = member
        _showAddDepositDialog.value = true
    }

    fun closeAddDepositDialog() {
        _showAddDepositDialog.value = false
        _preselectedMemberForDeposit.value = null
    }

    // Expense dialog control
    fun openAddExpenseDialog() {
        _showAddExpenseDialog.value = true
    }

    fun closeAddExpenseDialog() {
        _showAddExpenseDialog.value = false
    }

    // Receipt modal control
    fun openReceiptModal(deposit: Deposit) {
        _selectedDepositForReceipt.value = deposit
    }

    fun closeReceiptModal() {
        _selectedDepositForReceipt.value = null
    }

    // QR & Verification modal control
    fun openQrVerificationDialog() {
        _showQrVerificationDialog.value = true
    }

    fun closeQrVerificationDialog() {
        _showQrVerificationDialog.value = false
    }

    // Settings modal control
    fun openSettingsDialog() {
        _showSettingsDialog.value = true
    }

    fun closeSettingsDialog() {
        _showSettingsDialog.value = false
    }

    // CRUD actions
    fun addMember(
        nameBn: String,
        nameEn: String,
        phone: String,
        designation: String,
        monthlyFee: Double,
        bloodGroup: String,
        nid: String,
        address: String
    ) {
        val nextCodeNum = repository.members.value.size + 1
        val code = String.format("S360-%03d", nextCodeNum)
        val member = Member(
            id = UUID.randomUUID().toString(),
            memberCode = code,
            nameBn = nameBn.ifBlank { nameEn },
            nameEn = nameEn.ifBlank { nameBn },
            phone = phone,
            designation = designation,
            monthlySubscriptionAmount = monthlyFee,
            bloodGroup = bloodGroup,
            joiningDate = getCurrentDateString(),
            nidNumber = nid,
            address = address
        )
        repository.addMember(member)
        closeAddMemberDialog()
    }

    fun deleteMember(memberId: String) {
        repository.deleteMember(memberId)
        if (_selectedMemberForDetail.value?.id == memberId) {
            closeMemberDetail()
        }
    }

    fun recordDeposit(
        member: Member,
        amount: Double,
        month: String,
        paymentMethod: String,
        transactionRef: String,
        notes: String
    ): Deposit {
        val nextNum = repository.deposits.value.size + 101
        val receiptNo = "RCPT-2026-$nextNum"
        val code = "S360-" + (100000..999999).random()
        val deposit = Deposit(
            id = UUID.randomUUID().toString(),
            receiptNo = receiptNo,
            memberId = member.id,
            memberName = if (language.value == SamityLanguage.BN) member.nameBn else member.nameEn,
            memberCode = member.memberCode,
            amount = amount,
            month = month.ifBlank { getCurrentMonthName(language.value == SamityLanguage.BN) },
            date = getCurrentDateString(),
            paymentMethod = paymentMethod,
            transactionRef = transactionRef,
            notes = notes,
            status = "Approved",
            verifiedCode = code
        )
        repository.addDeposit(deposit)
        closeAddDepositDialog()
        openReceiptModal(deposit)
        return deposit
    }

    fun deleteDeposit(depositId: String) {
        repository.deleteDeposit(depositId)
    }

    fun recordExpense(
        title: String,
        category: String,
        amount: Double,
        paymentMethod: String,
        payeeName: String,
        remarks: String
    ) {
        val nextNum = repository.expenses.value.size + 201
        val voucherNo = "VOUCH-2026-$nextNum"
        val expense = Expense(
            id = UUID.randomUUID().toString(),
            voucherNo = voucherNo,
            title = title,
            category = category,
            amount = amount,
            date = getCurrentDateString(),
            paymentMethod = paymentMethod,
            payeeName = payeeName,
            remarks = remarks
        )
        repository.addExpense(expense)
        closeAddExpenseDialog()
    }

    fun deleteExpense(expenseId: String) {
        repository.deleteExpense(expenseId)
    }

    fun updateProfile(newProfile: SamityProfile) {
        repository.updateProfile(newProfile)
        closeSettingsDialog()
    }

    fun verifyDocument(query: String): Deposit? {
        return repository.findDocumentByCode(query)
    }
}
