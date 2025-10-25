class PersonManager {
    constructor() {
        this.persons = JSON.parse(localStorage.getItem('persons')) || [];
        this.init();
        this.checkExpiredPersons();
    }

    init() {
        document.getElementById('personForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addPerson();
        });
        this.displayPersons();
        this.updateStats();
    }

    addPerson() {
        const person = {
            id: Date.now().toString(),
            name: document.getElementById('name').value,
            age: document.getElementById('age').value,
            birthDate: document.getElementById('birthDate').value,
            location: document.getElementById('location').value,
            nationality: document.getElementById('nationality').value,
            idNumber: document.getElementById('idNumber').value,
            additionalInfo: document.getElementById('additionalInfo').value,
            createdAt: new Date().toISOString(),
            expiresAt: this.calculateExpiryDate(5) // 5 أشهر
        };

        this.persons.push(person);
        this.saveToLocalStorage();
        this.displayPersons();
        this.updateStats();
        document.getElementById('personForm').reset();
        
        this.showSuccessMessage('تم إضافة الشخص بنجاح! سيتم حذف البيانات تلقائياً بعد 5 أشهر');
    }

    calculateExpiryDate(months) {
        const date = new Date();
        date.setMonth(date.getMonth() + months);
        return date.toISOString();
    }

    isExpired(expiresAt) {
        return new Date() > new Date(expiresAt);
    }

    getRemainingDays(expiresAt) {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diffTime = expiry - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    checkExpiredPersons() {
        const now = new Date();
        const expiredCount = this.persons.filter(person => this.isExpired(person.expiresAt)).length;
        
        if (expiredCount > 0) {
            this.persons = this.persons.filter(person => !this.isExpired(person.expiresAt));
            this.saveToLocalStorage();
            this.displayPersons();
            this.updateStats();
        }
    }

    generateQRCode(personId) {
        const profileUrl = `${window.location.origin}/profile.html?id=${personId}`;
        const qr = qrcode(0, 'L');
        qr.addData(profileUrl);
        qr.make();
        return qr.createImgTag(4);
    }

    displayPersons() {
        const container = document.getElementById('personsList');
        container.innerHTML = '';

        if (this.persons.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="glass-card text-center py-5 animate__animated animate__fadeIn">
                        <i class="fas fa-users fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">لا يوجد أشخاص مضافين حالياً</h5>
                        <p class="text-muted">استخدم النموذج أعلاه لإضافة أول شخص</p>
                    </div>
                </div>
            `;
            return;
        }

        this.persons.forEach((person, index) => {
            const qrCode = this.generateQRCode(person.id);
            const isExpired = this.isExpired(person.expiresAt);
            const remainingDays = this.getRemainingDays(person.expiresAt);
            
            const card = `
                <div class="col-md-4 mb-4">
                    <div class="card person-card glass-card animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s">
                        ${isExpired ? '<div class="expiry-badge">منتهي</div>' : 
                          remainingDays <= 30 ? `<div class="expiry-badge" style="background: #f39c12;">${remainingDays} يوم</div>` : ''}
                        
                        <div class="card-body text-center">
                            <div class="qr-code floating mb-3">${qrCode}</div>
                            <h5 class="card-title">${person.name}</h5>
                            <p class="card-text">
                                <strong>العمر:</strong> ${person.age}<br>
                                <strong>المكان:</strong> ${person.location}
                            </p>
                            <p class="text-muted small">
                                ينتهي في: ${new Date(person.expiresAt).toLocaleDateString('ar-EG')}
                            </p>
                            <button onclick="personManager.deletePerson('${person.id}')" class="btn btn-outline-danger btn-sm">
                                <i class="fas fa-trash me-1"></i>حذف
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
    }

    deletePerson(personId) {
        if (confirm('هل أنت متأكد من حذف هذا الشخص؟')) {
            this.persons = this.persons.filter(p => p.id !== personId);
            this.saveToLocalStorage();
            this.displayPersons();
            this.updateStats();
            this.showSuccessMessage('تم حذف الشخص بنجاح!');
        }
    }

    updateStats() {
        const total = this.persons.length;
        const active = this.persons.filter(p => !this.isExpired(p.expiresAt)).length;
        const expired = total - active;

        document.getElementById('totalPersons').textContent = total;
        document.getElementById('activePersons').textContent = active;
        document.getElementById('expiredPersons').textContent = expired;
    }

    showSuccessMessage(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success position-fixed animate__animated animate__fadeInDown';
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
        alertDiv.innerHTML = `
            <strong>✅ نجاح!</strong> ${message}
        `;
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.classList.remove('animate__fadeInDown');
            alertDiv.classList.add('animate__fadeOutUp');
            setTimeout(() => alertDiv.remove(), 1000);
        }, 3000);
    }

    saveToLocalStorage() {
        localStorage.setItem('persons', JSON.stringify(this.persons));
    }
}

const personManager = new PersonManager();

// فحص الأشخاص المنتهية الصلاحية كل ساعة
setInterval(() => {
    personManager.checkExpiredPersons();
}, 60 * 60 * 1000);